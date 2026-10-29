from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.authorization import AllUser, CustomerStaffUser
from app.db.session import get_db_session
from app.repositories.customers import get_customer_by_id, list_customers
from app.repositories.vehicles import get_vehicles_by_customer_id
from app.schemas.customers import CustomerCreate, CustomerResponse, CustomerUpdate
from app.schemas.vehicles import VehicleCreate, VehicleCreateResponse
from app.services.customers import (
    DuplicateMobileNumberError,
    create_customer,
    update_customer,
)
from app.services.vehicles import create_vehicle

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get(
    "",
    response_model=list[CustomerResponse],
    responses={
        status.HTTP_401_UNAUTHORIZED: {"description": "Unauthorized"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"},
    },
)
async def list_customer_records(
    _current_user: CustomerStaffUser,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    search: Annotated[str | None, Query(max_length=150)] = None,
) -> list[CustomerResponse]:
    return [
        CustomerResponse.model_validate(customer)
        for customer in await list_customers(session, search)
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


@router.put(
    "/{customer_id}",
    response_model=CustomerResponse,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"description": "Unauthorized"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"},
        status.HTTP_404_NOT_FOUND: {"description": "Customer not found"},
        status.HTTP_409_CONFLICT: {"description": "Mobile number already exists"},
    },
)
async def edit_customer(
    customer_id: int,
    payload: CustomerUpdate,
    _current_user: CustomerStaffUser,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> CustomerResponse:
    customer = await get_customer_by_id(session, customer_id)
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )
    try:
        customer = await update_customer(session, customer, payload)
    except DuplicateMobileNumberError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A customer with this mobile number already exists.",
        ) from exc
    return CustomerResponse.model_validate(customer)


@router.post(
    "/{customer_id}/vehicles",
    response_model=VehicleCreateResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"description": "Unauthorized"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"},
        status.HTTP_404_NOT_FOUND: {"description": "Customer not found"},
        status.HTTP_409_CONFLICT: {
            "description": "Vehicle registration number already exists"
        },
    },
)
async def add_vehicles_to_customer(
    customer_id: int,
    payload: VehicleCreate,
    _current_user: CustomerStaffUser,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> VehicleCreateResponse:
    customer = await get_customer_by_id(session, customer_id)
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found."
        )
    return await create_vehicle(session, payload, customer_id)


@router.get(
    "/{customer_id}/vehicles",
    response_model=list[VehicleCreateResponse],
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"description": "Unauthorized"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"},
        status.HTTP_404_NOT_FOUND: {"description": "Customer not found"},
    },
)
async def list_customer_vehicles(
    customer_id: int,
    _current_user: AllUser,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> list[VehicleCreateResponse]:
    customer = await get_customer_by_id(session, customer_id)
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found."
        )
    return [
        VehicleCreateResponse.model_validate(vehicle)
        for vehicle in await get_vehicles_by_customer_id(session, customer_id)
    ]
