from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.db.models import User, UserSession


async def get_session_by_refresh_token_hash(
    session: AsyncSession,
    refresh_token_hash: str,
) -> UserSession | None:
    result = await session.execute(
        select(UserSession)
        .options(joinedload(UserSession.user).joinedload(User.role))
        .where(UserSession.refresh_token_hash == refresh_token_hash)
    )
    return result.scalar_one_or_none()
