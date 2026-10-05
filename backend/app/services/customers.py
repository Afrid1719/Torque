from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Customer
from app.schemas.customers import CustomerCreate, CustomerUpdate


class DuplicateMobileNumberError(Exception):
    pass


async def create_customer(
    session: AsyncSession,
    payload: CustomerCreate,
) -> Customer:
    customer = Customer(**payload.model_dump())
    session.add(customer)

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise DuplicateMobileNumberError from exc
    except SQLAlchemyError:
        await session.rollback()
        raise

    await session.refresh(customer)
    return customer


async def update_customer(
    session: AsyncSession,
    customer: Customer,
    payload: CustomerUpdate,
) -> Customer:
    for field, value in payload.model_dump().items():
        setattr(customer, field, value)
    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise DuplicateMobileNumberError from exc
    except SQLAlchemyError:
        await session.rollback()
        raise

    await session.refresh(customer)
    return customer
