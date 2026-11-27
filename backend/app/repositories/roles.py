from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Role


async def get_role_by_name(
    session: AsyncSession,
    role_name: str,
) -> Role | None:
    result = await session.execute(select(Role).where(Role.name == role_name))
    return result.scalar_one_or_none()
