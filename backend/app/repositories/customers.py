from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Customer


async def get_customer_by_id(
    session: AsyncSession,
    customer_id: int,
) -> Customer | None:
    result = await session.execute(select(Customer).where(Customer.id == customer_id))
    return result.scalar_one_or_none()


async def list_customers(
    session: AsyncSession,
    search: str | None = None,
) -> list[Customer]:
    statement = select(Customer).order_by(Customer.name.asc(), Customer.id.asc())

    if search:
        pattern = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Customer.name.ilike(pattern),
                Customer.mobile_number.ilike(pattern),
            )
        )

    result = await session.execute(statement)
    return list(result.scalars().all())
