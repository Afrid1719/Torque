from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.authorization import require_roles
from app.core.roles import RoleName
from app.db.models import User
from app.db.session import get_db_session
from app.repositories.customers import get_customer_by_id
from app.schemas.customers import CustomerCreate, CustomerResponse
from app.services.customers import DuplicateMobileNumberError, create_customer

router = APIRouter(prefix="/customers", tags=["customers"])

CustomerStaffUser = Annotated[
    User,
    Depends(
        require_roles(
            RoleName.WORKSHOP_MANAGER,
            RoleName.SERVICE_ADVISOR,
        )
    ),
]


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"description": "Unauthorized"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"},
        status.HTTP_409_CONFLICT: {"description": "Mobile number already exists"},
    },
)
async def add_customer(
    payload: CustomerCreate,
    _current_user: CustomerStaffUser,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> CustomerResponse:
    try:
        customer = await create_customer(session, payload)
    except DuplicateMobileNumberError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A customer with this mobile number already exists.",
        ) from exc
    return CustomerResponse.model_validate(customer)


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"description": "Unauthorized"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"},
        status.HTTP_404_NOT_FOUND: {"description": "Customer not found"},
    },
)
async def get_customer(
    customer_id: int,
    _current_user: CustomerStaffUser,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> CustomerResponse:
    customer = await get_customer_by_id(session, customer_id)
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )
    return CustomerResponse.model_validate(customer)
