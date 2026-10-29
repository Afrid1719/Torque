from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.vehicles import Vehicle


async def get_vehicle_by_id(session: AsyncSession, vehicle_id: int) -> Vehicle | None:
    result = await session.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    return result.scalar_one_or_none()


async def get_vehicles_by_customer_id(
    session: AsyncSession, customer_id: int
) -> list[Vehicle]:
    statement = (
        select(Vehicle)
        .order_by(Vehicle.make.asc(), Vehicle.model.asc(), Vehicle.variant.asc())
        .where(Vehicle.cust_id == customer_id)
    )

    result = await session.execute(statement)
    return list(result.scalars().all())


async def list_vehicles(
    session: AsyncSession, search: str | None = None
) -> list[Vehicle]:
    statement = select(Vehicle).order_by(
        Vehicle.make.asc(), Vehicle.model.asc(), Vehicle.variant.asc()
    )

    if search:
        pattern = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Vehicle.registration_number.ilike(pattern),
                Vehicle.make.ilike(pattern),
                Vehicle.model.ilike(pattern),
                Vehicle.variant.ilike(pattern),
                Vehicle.vehicle_type.ilike(pattern),
                Vehicle.fuel_type.ilike(pattern),
                Vehicle.transmission.ilike(pattern),
                Vehicle.color.ilike(pattern),
                Vehicle.vin.ilike(pattern),
            )
        )

    result = await session.execute(statement)
    return list(result.scalars().all())
