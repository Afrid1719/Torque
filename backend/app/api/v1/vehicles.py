from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.schemas.vehicles import VehicleCreate, VehicleCreateResponse
from app.services.vehicles import create_vehicle

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
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> VehicleCreateResponse:
    return await create_vehicle(session, payload, customer_id)
