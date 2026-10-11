from enum import StrEnum

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enum import FuelTypeEnum, TransmissionEnum, VehicleTypeEnum
from app.db.base import Base
from app.db.models.auth import TimestampMixin


def _enum_check_constraint(
    column_name: str,
    enum_type: type[StrEnum],
    constraint_name: str,
) -> CheckConstraint:
    values = ", ".join(
        "'" + member.value.replace("'", "''") + "'" for member in enum_type
    )
    return CheckConstraint(
        f"{column_name} IN ({values})",
        name=constraint_name,
    )


class Vehicles(TimestampMixin, Base):
    __tablename__ = "vehicles"
    __table_args__ = (
        _enum_check_constraint(
            "vehicle_type",
            VehicleTypeEnum,
            "vehicle_type_check",
        ),
        _enum_check_constraint("fuel_type", FuelTypeEnum, "fuel_type_check"),
        _enum_check_constraint(
            "transmission",
            TransmissionEnum,
            "transmission_check",
        ),
        CheckConstraint("odometer > 0", name="odometer_reading_check"),
        CheckConstraint(
            "manufacture_year >= 1970",
            name="vehicle_manufacture_year_check",
        ),
        CheckConstraint("engine_capacity >= 998", name="engine_cc_check"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cust_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey(
            "customers.id",
            name="cust_vehicles_key",
            onupdate="CASCADE",
            ondelete="SET NULL",
        ),
    )
    registration_number: Mapped[str] = mapped_column(String(10), nullable=False, unique=True)
    make: Mapped[str] = mapped_column(String(20), nullable=False)
    model: Mapped[str] = mapped_column(String(30), nullable=False)
    variant: Mapped[str] = mapped_column(String(45), nullable=False)
    vehicle_type: Mapped[str] = mapped_column(String(25), nullable=False)
    fuel_type: Mapped[str] = mapped_column(String(10), nullable=False)
    transmission: Mapped[str] = mapped_column(String(15), nullable=False)
    color: Mapped[str] = mapped_column(String(30), nullable=False)
    vin: Mapped[str] = mapped_column(String(20), nullable=False)
    odometer: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    chassis_number: Mapped[str | None] = mapped_column(String(20))
    manufacture_year: Mapped[int | None] = mapped_column(Integer)
    engine_capacity: Mapped[int | None] = mapped_column(Integer)
    