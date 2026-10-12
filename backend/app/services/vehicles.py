from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.vehicles import Vehicle
from app.schemas.vehicles import VehicleCreate, VehicleCreateResponse


class DuplicateRegistrationError(Exception):
    pass


class DuplicateVinError(Exception):
    pass


async def create_vehicle(
    session: AsyncSession, payload: VehicleCreate, customer_id: int | None = None
) -> VehicleCreateResponse:
    vehicle = Vehicle(**payload.model_dump())
    vehicle.cust_id = customer_id
    session.add(vehicle)

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        print(f"IntegrityError: {exc}")
        raise
    except SQLAlchemyError:
        await session.rollback()
        raise

    await session.refresh(vehicle)
    return VehicleCreateResponse.model_validate(vehicle)
