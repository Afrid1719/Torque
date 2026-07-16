import asyncio
from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

import jwt
import pytest
from pydantic import SecretStr
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.core.security import hash_password
from app.core.tokens import hash_refresh_token
from app.db.models import Role, User, UserSession
from app.services import auth
from app.services.auth import (
    InvalidCredentialsError,
    InvalidRefreshSessionError,
    authenticate_user,
    refresh_access_token,
)

TEST_PASSWORD = "login-service-test-password-123"
TEST_SECRET = "torque_service_test_only_secret_key_32_chars"


def build_user(*, is_active: bool = True) -> User:
    return User(
        id=7,
        username="manager",
        password_hash=hash_password(TEST_PASSWORD),
        is_active=is_active,
        role=Role(
            id=1,
            name="workshop_manager",
            display_name="Workshop Manager",
        ),
    )


def build_session() -> MagicMock:
    session = MagicMock(spec=AsyncSession)
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    return session


def build_refresh_session(
    *,
    expires_at: datetime,
    revoked_at: datetime | None = None,
    is_active: bool = True,
) -> UserSession:
    return UserSession(
        id=11,
        user_id=7,
        refresh_token_hash="stored-refresh-token-hash",
        expires_at=expires_at,
        revoked_at=revoked_at,
        user=build_user(is_active=is_active),
    )


def build_settings() -> Settings:
    return Settings(
        APP_ENV="testing",
        JWT_SECRET_KEY=SecretStr(TEST_SECRET),
        ACCESS_TOKEN_EXPIRE_MINUTES=15,
    )


def test_authenticate_user_creates_access_token_and_hashed_session(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = build_session()
    user = build_user()
    lookup = AsyncMock(return_value=user)
    monkeypatch.setattr(auth, "get_user_by_username", lookup)
    authenticated_at = datetime.now(UTC).replace(microsecond=0)

    result = asyncio.run(
        authenticate_user(
            session=session,
            username=" Manager ",
            plain_password=TEST_PASSWORD,
            settings=build_settings(),
            user_agent="test-agent",
            ip_address="127.0.0.1",
            authenticated_at=authenticated_at,
        )
    )

    lookup.assert_awaited_once_with(session, "manager")
    session.commit.assert_awaited_once()
    session.rollback.assert_not_awaited()
    stored_session = session.add.call_args.args[0]
    assert isinstance(stored_session, UserSession)
    assert stored_session.user_id == user.id
    assert stored_session.refresh_token_hash == hash_refresh_token(result.refresh_token)
    assert stored_session.refresh_token_hash != result.refresh_token
    assert stored_session.expires_at == authenticated_at + timedelta(days=10)
    assert stored_session.user_agent == "test-agent"
    assert stored_session.ip_address == "127.0.0.1"

    claims = jwt.decode(result.access_token, TEST_SECRET, algorithms=["HS256"])
    assert claims["sub"] == str(user.id)
    assert claims["role"] == "workshop_manager"
    assert result.access_token_expires_in == 15 * 60


def test_authenticate_user_creates_30_day_remembered_session(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = build_session()
    monkeypatch.setattr(
        auth, "get_user_by_username", AsyncMock(return_value=build_user())
    )
    authenticated_at = datetime.now(UTC).replace(microsecond=0)

    asyncio.run(
        authenticate_user(
            session=session,
            username="manager",
            plain_password=TEST_PASSWORD,
            settings=build_settings(),
            remember_me=True,
            authenticated_at=authenticated_at,
        )
    )

    stored_session = session.add.call_args.args[0]
    assert stored_session.expires_at == authenticated_at + timedelta(days=30)


@pytest.mark.parametrize(
    ("user", "password"),
    [
        (None, TEST_PASSWORD),
        (build_user(), "incorrect-password"),
        (build_user(is_active=False), TEST_PASSWORD),
    ],
)
def test_authenticate_user_rejects_all_invalid_credentials_identically(
    monkeypatch: pytest.MonkeyPatch,
    user: User | None,
    password: str,
) -> None:
    session = build_session()
    monkeypatch.setattr(auth, "get_user_by_username", AsyncMock(return_value=user))

    with pytest.raises(InvalidCredentialsError):
        asyncio.run(
            authenticate_user(
                session=session,
                username="manager",
                plain_password=password,
                settings=build_settings(),
            )
        )

    session.add.assert_not_called()
    session.commit.assert_not_awaited()


def test_authenticate_user_rolls_back_session_write_failure(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = build_session()
    session.commit.side_effect = SQLAlchemyError("database unavailable")
    monkeypatch.setattr(
        auth,
        "get_user_by_username",
        AsyncMock(return_value=build_user()),
    )

    with pytest.raises(SQLAlchemyError):
        asyncio.run(
            authenticate_user(
                session=session,
                username="manager",
                plain_password=TEST_PASSWORD,
                settings=build_settings(),
            )
        )

    session.rollback.assert_awaited_once()


def test_refresh_access_token_uses_current_database_role_and_updates_session(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = build_session()
    refreshed_at = datetime.now(UTC).replace(microsecond=0)
    stored_session = build_refresh_session(expires_at=refreshed_at + timedelta(days=5))
    lookup = AsyncMock(return_value=stored_session)
    monkeypatch.setattr(auth, "get_session_by_refresh_token_hash", lookup)

    result = asyncio.run(
        refresh_access_token(
            session=session,
            raw_refresh_token="raw-refresh-token",
            settings=build_settings(),
            refreshed_at=refreshed_at,
        )
    )

    lookup.assert_awaited_once_with(
        session,
        hash_refresh_token("raw-refresh-token"),
    )
    assert stored_session.last_used_at == refreshed_at
    session.commit.assert_awaited_once()
    claims = jwt.decode(result.access_token, TEST_SECRET, algorithms=["HS256"])
    assert claims["sub"] == "7"
    assert claims["role"] == "workshop_manager"
    assert result.access_token_expires_in == 15 * 60


@pytest.mark.parametrize(
    "stored_session",
    [
        None,
        build_refresh_session(expires_at=datetime.now(UTC) - timedelta(seconds=1)),
        build_refresh_session(
            expires_at=datetime.now(UTC) + timedelta(days=1),
            revoked_at=datetime.now(UTC),
        ),
        build_refresh_session(
            expires_at=datetime.now(UTC) + timedelta(days=1),
            is_active=False,
        ),
    ],
    ids=["missing", "expired", "revoked", "inactive-user"],
)
def test_refresh_access_token_rejects_invalid_sessions_identically(
    monkeypatch: pytest.MonkeyPatch,
    stored_session: UserSession | None,
) -> None:
    session = build_session()
    monkeypatch.setattr(
        auth,
        "get_session_by_refresh_token_hash",
        AsyncMock(return_value=stored_session),
    )

    with pytest.raises(InvalidRefreshSessionError):
        asyncio.run(
            refresh_access_token(
                session=session,
                raw_refresh_token="raw-refresh-token",
                settings=build_settings(),
            )
        )

    session.commit.assert_not_awaited()


def test_refresh_access_token_rolls_back_last_used_write_failure(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = build_session()
    session.commit.side_effect = SQLAlchemyError("database unavailable")
    monkeypatch.setattr(
        auth,
        "get_session_by_refresh_token_hash",
        AsyncMock(
            return_value=build_refresh_session(
                expires_at=datetime.now(UTC) + timedelta(days=1)
            )
        ),
    )

    with pytest.raises(SQLAlchemyError):
        asyncio.run(
            refresh_access_token(
                session=session,
                raw_refresh_token="raw-refresh-token",
                settings=build_settings(),
            )
        )

    session.rollback.assert_awaited_once()
