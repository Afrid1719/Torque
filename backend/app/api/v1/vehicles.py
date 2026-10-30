from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.authorization import CustomerStaffUser
from app.db.session import get_db_session
from app.repositories.vehicles import get_vehicle_by_id, list_vehicles
from app.schemas.vehicles import VehicleCreate, VehicleCreateResponse
from app.services.vehicles import create_vehicle, update_vehicle

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.post(
    "",
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
async def add_vehicle(
    customer_id: int,
    payload: VehicleCreate,
    _currentUser: CustomerStaffUser,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> VehicleCreateResponse:
    return await create_vehicle(session, payload, customer_id)


@router.get(
    "",
    response_model=list[VehicleCreateResponse],
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"description": "Unauthorized"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"},
    },
)
async def get_vehicles(
    _current_user: CustomerStaffUser,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    query: str | None = None,
) -> list[VehicleCreateResponse]:
    return [
        VehicleCreateResponse.model_validate(vehicle)
        for vehicle in await list_vehicles(session, query)
    ]


@router.get(
    "/{vehicle_id}",
    response_model=VehicleCreateResponse,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"description": "Unauthorized"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"},
        status.HTTP_404_NOT_FOUND: {"description": "Vehicle not found"},
    },
)
async def fetch_vehicle_by_id(
    vehicle_id: int,
    _current_user: CustomerStaffUser,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> VehicleCreateResponse:
    vehicle = await get_vehicle_by_id(session, vehicle_id)
    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found.",
        )
    return VehicleCreateResponse.model_validate(vehicle)


@router.put(
    "/{vehicle_id}",
    response_model=VehicleCreateResponse,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"description": "Unauthorized"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"},
        status.HTTP_404_NOT_FOUND: {"description": "Vehicle not found"},
        status.HTTP_409_CONFLICT: {
            "description": "Registration/Vin number already exists"
        },
    },
)
async def edit_vehicle(
    vehicle_id: int,
    payload: VehicleCreate,
    _current_user: CustomerStaffUser,
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> VehicleCreateResponse:
    vehicle = await get_vehicle_by_id(session, vehicle_id)
    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found."
        )
    try:
        res = await update_vehicle(session, vehicle, payload)
        return VehicleCreateResponse.model_validate(res)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Registration/Vin number already exists",
        ) from exc
