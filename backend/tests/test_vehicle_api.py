from collections.abc import AsyncGenerator, Iterator
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from app.api.v1 import vehicles as vehicle_api
from app.db.session import get_db_session
from app.main import app
from app.schemas.vehicles import VehicleCreateResponse


async def override_db_session() -> AsyncGenerator[object, None]:
    yield object()


@pytest.fixture
def client() -> Iterator[TestClient]:
    app.dependency_overrides[get_db_session] = override_db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def build_vehicle_response() -> VehicleCreateResponse:
    return VehicleCreateResponse(
        id=42,
        registration_number="MH12AB1234",
        make="MARUTI",
        model="SWIFT",
        variant="VXI",
        vehicle_type="PRIVATE",
        fuel_type="PETROL",
        transmission="MANUAL",
        color="WHITE",
        vin="1HGCM82633A004352",
        odometer=25000,
        is_active=True,
        manufacture_year=2022,
        engine_capacity=1197,
    )


def vehicle_payload() -> dict[str, object]:
    return {
        "registration_number": "MH12AB1234",
        "make": "Maruti",
        "model": "Swift",
        "variant": "VXI",
        "vehicle_type": "private",
        "fuel_type": "petrol",
        "transmission": "manual",
        "color": "White",
        "vin": "1HGCM82633A004352",
        "odometer": 25000,
        "manufacture_year": 2022,
        "engine_capacity": 1197,
    }


def test_create_vehicle_returns_created_vehicle(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    create = AsyncMock(return_value=build_vehicle_response())
    monkeypatch.setattr(vehicle_api, "create_vehicle", create)

    response = client.post(
        "/api/v1/vehicles",
        params={"customer_id": 23},
        json=vehicle_payload(),
    )

    assert response.status_code == 201
    assert response.json() == {
        "id": 42,
        "registration_number": "MH12AB1234",
        "make": "MARUTI",
        "model": "SWIFT",
        "variant": "VXI",
        "vehicle_type": "PRIVATE",
        "fuel_type": "PETROL",
        "transmission": "MANUAL",
        "color": "WHITE",
        "vin": "1HGCM82633A004352",
        "odometer": 25000,
        "is_active": True,
        "manufacture_year": 2022,
        "engine_capacity": 1197,
    }
    create.assert_awaited_once()
    assert create.await_args is not None
    session, payload, customer_id = create.await_args.args
    assert session is not None
    assert payload.registration_number == "MH12AB1234"
    assert customer_id == 23


def test_create_vehicle_rejects_invalid_payload(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    create = AsyncMock(return_value=build_vehicle_response())
    monkeypatch.setattr(vehicle_api, "create_vehicle", create)
    data = vehicle_payload()
    data["odometer"] = 0

    response = client.post(
        "/api/v1/vehicles",
        params={"customer_id": 23},
        json=data,
    )

    assert response.status_code == 422
    create.assert_not_awaited()


def test_create_vehicle_requires_customer_id(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    create = AsyncMock(return_value=build_vehicle_response())
    monkeypatch.setattr(vehicle_api, "create_vehicle", create)

    response = client.post("/api/v1/vehicles", json=vehicle_payload())

    assert response.status_code == 422
    create.assert_not_awaited()
