import asyncio
from unittest.mock import AsyncMock, Mock

from sqlalchemy import String, inspect

from app.db.models.vehicles import Vehicle
from app.repositories.vehicles import (
    get_vehicle_by_id,
    get_vehicles_by_customer_id,
    list_vehicles,
)


def build_session(*, vehicles: list[Vehicle] | None = None) -> AsyncMock:
    session = AsyncMock()
    result = Mock()
    result.scalar_one_or_none.return_value = vehicles[0] if vehicles else None
    result.scalars.return_value.all.return_value = vehicles or []
    session.execute.return_value = result
    return session


def build_vehicle(
    *,
    vehicle_id: int = 42,
    customer_id: int | None = 23,
    make: str = "MARUTI",
    model: str = "SWIFT",
    variant: str = "VXI",
) -> Vehicle:
    return Vehicle(
        id=vehicle_id,
        cust_id=customer_id,
        registration_number=f"MH12AB{vehicle_id:04}",
        make=make,
        model=model,
        variant=variant,
        vehicle_type="private",
        fuel_type="petrol",
        transmission="manual",
        color="white",
        vin=f"1HGCM82633A00{vehicle_id:04}",
        odometer=25000,
        is_active=True,
        manufacture_year=2022,
        engine_capacity=1197,
    )


def test_get_vehicle_by_id_returns_matching_vehicle() -> None:
    vehicle = build_vehicle()
    session = build_session(vehicles=[vehicle])

    result = asyncio.run(get_vehicle_by_id(session, vehicle.id))

    assert result is vehicle
    session.execute.assert_awaited_once()
    statement = session.execute.await_args.args[0]
    compiled = statement.compile()
    assert "WHERE vehicles.id =" in str(compiled)
    assert vehicle.id in compiled.params.values()


def test_get_vehicle_by_id_returns_none_when_not_found() -> None:
    session = build_session()

    result = asyncio.run(get_vehicle_by_id(session, 404))

    assert result is None
    session.execute.assert_awaited_once()


def test_get_vehicles_by_customer_id_filters_and_orders_results() -> None:
    vehicles = [build_vehicle(), build_vehicle(vehicle_id=43)]
    session = build_session(vehicles=vehicles)

    result = asyncio.run(get_vehicles_by_customer_id(session, 23))

    assert result == vehicles
    statement = session.execute.await_args.args[0]
    compiled = statement.compile()
    sql = str(compiled)
    assert "WHERE vehicles.cust_id =" in sql
    assert "ORDER BY vehicles.make ASC, vehicles.model ASC, vehicles.variant ASC" in sql
    assert 23 in compiled.params.values()


def test_get_vehicles_by_customer_id_returns_empty_list() -> None:
    session = build_session()

    result = asyncio.run(get_vehicles_by_customer_id(session, 23))

    assert result == []


def test_list_vehicles_without_search_returns_all_rows_in_order() -> None:
    vehicles = [build_vehicle(), build_vehicle(vehicle_id=43)]
    session = build_session(vehicles=vehicles)

    result = asyncio.run(list_vehicles(session))

    assert result == vehicles
    statement = session.execute.await_args.args[0]
    sql = str(statement.compile())
    assert "WHERE" not in sql
    assert "ORDER BY vehicles.make ASC, vehicles.model ASC, vehicles.variant ASC" in sql


def test_list_vehicles_searches_all_string_columns_dynamically() -> None:
    session = build_session()

    asyncio.run(list_vehicles(session, " swift "))

    statement = session.execute.await_args.args[0]
    compiled = statement.compile()
    sql = str(compiled)
    string_column_names = {
        column.key
        for column in inspect(Vehicle).columns
        if isinstance(column.type, String)
    }

    for column_name in string_column_names:
        assert f"vehicles.{column_name}" in sql
    assert "OR" in sql
    assert set(compiled.params.values()) == {"%swift%"}
