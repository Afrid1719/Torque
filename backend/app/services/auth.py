from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.core.security import dummy_password_hash, verify_password
from app.core.tokens import create_access_token, create_refresh_token
from app.db.models import UserSession
from app.repositories.users import get_user_by_username


class InvalidCredentialsError(Exception):
    pass


@dataclass(frozen=True)
class LoginResult:
    access_token: str
    access_token_expires_in: int
    refresh_token: str
    refresh_session_expires_at: datetime


async def authenticate_user(
    session: AsyncSession,
    username: str,
    plain_password: str,
    settings: Settings,
    remember_me: bool = False,
    user_agent: str | None = None,
    ip_address: str | None = None,
    authenticated_at: datetime | None = None,
) -> LoginResult:
    authenticated_at = authenticated_at or datetime.now(UTC)
    user = await get_user_by_username(session, username.strip().lower())
    stored_hash = user.password_hash if user is not None else dummy_password_hash
    password_is_valid = verify_password(plain_password, stored_hash)

    if user is None or not password_is_valid or not user.is_active:
        raise InvalidCredentialsError

    access_token = create_access_token(
        user_id=user.id,
        role=user.role.name,
        settings=settings,
        issued_at=authenticated_at,
    )
    refresh_token = create_refresh_token()
    refresh_session_expire_days = (
        settings.remembered_refresh_session_expire_days
        if remember_me
        else settings.refresh_session_expire_days
    )
    refresh_session_expires_at = authenticated_at + timedelta(
        days=refresh_session_expire_days
    )

    session.add(
        UserSession(
            user_id=user.id,
            refresh_token_hash=refresh_token.token_hash,
            expires_at=refresh_session_expires_at,
            user_agent=user_agent,
            ip_address=ip_address,
        )
    )
    try:
        await session.commit()
    except SQLAlchemyError:
        await session.rollback()
        raise

    return LoginResult(
        access_token=access_token.value,
        access_token_expires_in=settings.access_token_expire_seconds,
        refresh_token=refresh_token.raw_value,
        refresh_session_expires_at=refresh_session_expires_at,
    )
