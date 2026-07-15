from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.health import DatabaseUnavailableError, check_database_connection
from app.db.session import get_db_session

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "torque-api"}


@router.get("/health/database")
async def database_health_check(
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, str]:
    try:
        await check_database_connection(session)
    except DatabaseUnavailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unavailable",
                "service": "torque-database",
                "message": "Database connectivity check failed.",
            },
        ) from exc

    return {
        "status": "ok",
        "service": "torque-database",
    }
