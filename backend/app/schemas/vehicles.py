import re
from datetime import date
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

from app.core.enum import VehicleTypeEnum

RegistrationNumber = Annotated[
    str,
    StringConstraints(min_length=9, max_length=10),
]

Make = Annotated[str, StringConstraints(min_length=2, max_length=20)]

Model = Annotated[str, StringConstraints(min_length=3, max_length=30)]

Variant = Annotated[str, StringConstraints(min_length=1, max_length=45)]

VehicleType = Annotated[str, StringConstraints(min_length=5, max_length=25)]

FuelType = Annotated[str, StringConstraints(min_length=2, max_length=6)]

Transmission = Annotated[str, StringConstraints(min_length=4, max_length=15)]

Color = Annotated[str, StringConstraints(min_length=3, max_length=30)]

Vin = Annotated[str, StringConstraints(min_length=17, max_length=20)]

Odometer = Annotated[int, Field(gt=0)]

IsActive = Annotated[bool, Field(default=True)]

ManufactureYear = Annotated[int, Field(ge=1970, le=date.today().year)]

EngineCapacity = Annotated[int, Field(ge=998)]


class VehicleCreate(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")

    registration_number: RegistrationNumber
    make: Make
    model: Model
    variant: Variant
    vehicle_type: VehicleType
    fuel_type: FuelType
    transmission: Transmission
    color: Color
    vin: Vin
    odometer: Odometer
    is_active: IsActive
    manufacture_year: ManufactureYear | None
    engine_capacity: EngineCapacity | None

    @field_validator(
        "registration_number",
        "make",
        "model",
        "variant",
        "vehicle_type",
        "fuel_type",
        "transmission",
        "color",
        "vin",
        mode="before",
    )
    @classmethod
    def normalize_fields(cls, value: object) -> object:
        if not isinstance(value, str):
            raise ValueError("Field must be a string")
        return value.strip().upper()

    @field_validator("registration_number")
    @classmethod
    def validate_registration(cls, value: str) -> str:
        if not re.compile(r"^[A-Z]{2}\d{2}[A-Z]{1,3}\d{3,4}$").match(
            value
        ) and not re.compile(r"^\d{2}BH\d{4}[A-Z]{1,2}$").match(value):
            raise ValueError("Invalid registration format")
        return value

    @field_validator("vehicle_type")
    @classmethod
    def validate_vehicle_type(cls, value: str) -> str:
        if value.lower() not in [v_type.value for v_type in VehicleTypeEnum]:
            raise ValueError("Invalid vehicle type")
        return value

    @field_validator("vin")
    @classmethod
    def validate_vin(cls, value: str) -> str:
        if not re.compile(r"^[A-HJ-NPR-Z0-9]{17}$").match(value):
            raise ValueError("Invalid VIN format")
        return value


class VehicleCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: int
    registration_number: str
    make: str
    model: str
    variant: str
    vehicle_type: str
    fuel_type: str
    transmission: str
    color: str
    vin: str
    odometer: int
    is_active: bool
    manufacture_year: int | None
    engine_capacity: int | None
