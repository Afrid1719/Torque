from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class DatabaseUnavailableError(Exception):
    pass


async def check_database_connection(session: AsyncSession) -> bool:
    try:
        result = await session.execute(text("SELECT 1"))
    except Exception as exc:
        raise DatabaseUnavailableError("Database connectivity check failed.") from exc

    return result.scalar_one() == 1
