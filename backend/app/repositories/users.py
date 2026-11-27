from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.db.models import User


async def get_user_by_username(
    session: AsyncSession,
    username: str,
) -> User | None:
    result = await session.execute(
        select(User).options(joinedload(User.role)).where(User.username == username)
    )
    return result.scalar_one_or_none()


async def get_user_by_id(
    session: AsyncSession,
    user_id: int,
) -> User | None:
    result = await session.execute(
        select(User).options(joinedload(User.role)).where(User.id == user_id)
    )
    return result.scalar_one_or_none()
