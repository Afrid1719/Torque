import asyncio
from unittest.mock import AsyncMock, Mock

import pytest
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.db.models.vehicles import Vehicle
from app.schemas.vehicles import VehicleCreate
from app.services.vehicles import create_vehicle


def build_session() -> AsyncMock:
    session = AsyncMock()
    session.add = Mock()
    return session


def build_payload() -> VehicleCreate:
    return VehicleCreate(
        registration_number="MH12AB1234",
        make="Maruti",
        model="Swift",
        variant="VXI",
        vehicle_type="private",
        fuel_type="petrol",
        transmission="manual",
        color="White",
        vin="1HGCM82633A004352",
        odometer=25000,
        is_active=True,
        manufacture_year=2022,
        engine_capacity=1197,
    )


@pytest.mark.parametrize("customer_id", [None, 23])
def test_create_vehicle_commits_refreshes_and_returns_response(
    customer_id: int | None,
) -> None:
    session = build_session()

    async def refresh_vehicle(vehicle: Vehicle) -> None:
        vehicle.id = 42

    session.refresh.side_effect = refresh_vehicle

    result = asyncio.run(create_vehicle(session, build_payload(), customer_id))

    assert result.id == 42
    assert result.registration_number == "MH12AB1234"
    assert result.make == "MARUTI"
    assert result.is_active is True
    session.add.assert_called_once()
    added_vehicle = session.add.call_args.args[0]
    assert isinstance(added_vehicle, Vehicle)
    assert added_vehicle.cust_id == customer_id
    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once_with(added_vehicle)
    session.rollback.assert_not_awaited()


def test_create_vehicle_rolls_back_and_reraises_integrity_error(
    capsys: pytest.CaptureFixture[str],
) -> None:
    session = build_session()
    error = IntegrityError("statement", {}, Exception())
    session.commit.side_effect = error

    with pytest.raises(IntegrityError) as exc_info:
        asyncio.run(create_vehicle(session, build_payload(), customer_id=23))

    assert exc_info.value is error
    session.rollback.assert_awaited_once()
    session.refresh.assert_not_awaited()
    assert "IntegrityError:" in capsys.readouterr().out


def test_create_vehicle_rolls_back_and_reraises_other_database_errors() -> None:
    session = build_session()
    error = SQLAlchemyError("database unavailable")
    session.commit.side_effect = error

    with pytest.raises(SQLAlchemyError) as exc_info:
        asyncio.run(create_vehicle(session, build_payload(), customer_id=23))

    assert exc_info.value is error
    session.rollback.assert_awaited_once()
    session.refresh.assert_not_awaited()
