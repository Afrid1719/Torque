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
from app.services.auth import InvalidCredentialsError, authenticate_user

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
