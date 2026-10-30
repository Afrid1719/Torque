from collections.abc import AsyncGenerator, Iterator
from datetime import UTC, datetime
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.api.dependencies import auth as auth_dependencies
from app.api.v1 import vehicles as vehicle_api
from app.core.config import Settings, get_settings
from app.core.tokens import create_access_token
from app.db.models import Role, User
from app.db.session import get_db_session
from app.main import app
from app.schemas.vehicles import VehicleCreateResponse
from app.services.vehicles import DuplicateRegistrationVinError

TEST_SETTINGS = Settings(
    APP_ENV="testing",
    JWT_SECRET_KEY=SecretStr("torque_vehicle_api_test_secret_32_chars"),
)


async def override_db_session() -> AsyncGenerator[object, None]:
    yield object()


@pytest.fixture
def client() -> Iterator[TestClient]:
    app.dependency_overrides[get_db_session] = override_db_session
    app.dependency_overrides[get_settings] = lambda: TEST_SETTINGS
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def build_user(role_name: str) -> User:
    return User(
        id=7,
        username="staff",
        password_hash="not-returned",
        is_active=True,
        role=Role(id=1, name=role_name, display_name=role_name),
    )


def authorization_header() -> dict[str, str]:
    token = create_access_token(
        user_id=7,
        role="mechanic",
        settings=TEST_SETTINGS,
        issued_at=datetime.now(UTC),
    )
    return {"Authorization": f"Bearer {token.value}"}


def authenticate_as(monkeypatch: pytest.MonkeyPatch, role_name: str) -> None:
    monkeypatch.setattr(
        auth_dependencies,
        "get_user_by_id",
        AsyncMock(return_value=build_user(role_name)),
    )


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
    authenticate_as(monkeypatch, "service_advisor")
    create = AsyncMock(return_value=build_vehicle_response())
    monkeypatch.setattr(vehicle_api, "create_vehicle", create)

    response = client.post(
        "/api/v1/vehicles",
        headers=authorization_header(),
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
    authenticate_as(monkeypatch, "service_advisor")
    create = AsyncMock(return_value=build_vehicle_response())
    monkeypatch.setattr(vehicle_api, "create_vehicle", create)
    data = vehicle_payload()
    data["odometer"] = 0

    response = client.post(
        "/api/v1/vehicles",
        headers=authorization_header(),
        params={"customer_id": 23},
        json=data,
    )

    assert response.status_code == 422
    create.assert_not_awaited()


def test_create_vehicle_requires_customer_id(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    authenticate_as(monkeypatch, "service_advisor")
    create = AsyncMock(return_value=build_vehicle_response())
    monkeypatch.setattr(vehicle_api, "create_vehicle", create)

    response = client.post(
        "/api/v1/vehicles",
        headers=authorization_header(),
        json=vehicle_payload(),
    )

    assert response.status_code == 422
    create.assert_not_awaited()


@pytest.mark.parametrize("role_name", ["workshop_manager", "service_advisor"])
def test_authorized_staff_can_list_vehicles(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    role_name: str,
) -> None:
    authenticate_as(monkeypatch, role_name)
    list_vehicles = AsyncMock(
        return_value=[build_vehicle_response(), build_vehicle_response()]
    )
    monkeypatch.setattr(vehicle_api, "list_vehicles", list_vehicles)

    response = client.get(
        "/api/v1/vehicles",
        headers=authorization_header(),
    )

    assert response.status_code == 200
    assert [vehicle["id"] for vehicle in response.json()] == [42, 42]
    list_vehicles.assert_awaited_once()
    assert list_vehicles.await_args is not None
    assert list_vehicles.await_args.args[1] is None


def test_vehicle_list_passes_search_query_to_repository(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate_as(monkeypatch, "service_advisor")
    list_vehicles = AsyncMock(return_value=[build_vehicle_response()])
    monkeypatch.setattr(vehicle_api, "list_vehicles", list_vehicles)

    response = client.get(
        "/api/v1/vehicles",
        params={"query": "swift"},
        headers=authorization_header(),
    )

    assert response.status_code == 200
    assert list_vehicles.await_args is not None
    assert list_vehicles.await_args.args[1] == "swift"


def test_vehicle_list_requires_authentication(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    list_vehicles = AsyncMock()
    monkeypatch.setattr(vehicle_api, "list_vehicles", list_vehicles)

    response = client.get("/api/v1/vehicles")

    assert response.status_code == 401
    list_vehicles.assert_not_awaited()


def test_mechanic_cannot_list_vehicles(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate_as(monkeypatch, "mechanic")
    list_vehicles = AsyncMock()
    monkeypatch.setattr(vehicle_api, "list_vehicles", list_vehicles)

    response = client.get(
        "/api/v1/vehicles",
        headers=authorization_header(),
    )

    assert response.status_code == 403
    list_vehicles.assert_not_awaited()


def test_authorized_staff_can_fetch_vehicle_by_id(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate_as(monkeypatch, "service_advisor")
    lookup = AsyncMock(return_value=build_vehicle_response())
    monkeypatch.setattr(vehicle_api, "get_vehicle_by_id", lookup)

    response = client.get(
        "/api/v1/vehicles/42",
        headers=authorization_header(),
    )

    assert response.status_code == 200
    assert response.json()["id"] == 42
    lookup.assert_awaited_once()
    assert lookup.await_args is not None
    assert lookup.await_args.args[1] == 42


def test_fetch_missing_vehicle_returns_not_found(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate_as(monkeypatch, "workshop_manager")
    lookup = AsyncMock(return_value=None)
    monkeypatch.setattr(vehicle_api, "get_vehicle_by_id", lookup)

    response = client.get(
        "/api/v1/vehicles/404",
        headers=authorization_header(),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Vehicle not found."}


def test_authorized_staff_can_update_vehicle(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate_as(monkeypatch, "service_advisor")
    vehicle = build_vehicle_response()
    lookup = AsyncMock(return_value=vehicle)
    update = AsyncMock(return_value=vehicle)
    monkeypatch.setattr(vehicle_api, "get_vehicle_by_id", lookup)
    monkeypatch.setattr(vehicle_api, "update_vehicle", update)
    data = vehicle_payload()
    data["make"] = "Honda"

    response = client.put(
        "/api/v1/vehicles/42",
        headers=authorization_header(),
        json=data,
    )

    assert response.status_code == 200
    assert response.json()["id"] == 42
    lookup.assert_awaited_once()
    assert lookup.await_args is not None
    assert lookup.await_args.args[1] == 42
    update.assert_awaited_once()
    assert update.await_args is not None
    assert update.await_args.args[1] is vehicle
    assert update.await_args.args[2].make == "HONDA"


def test_update_duplicate_registration_or_vin_returns_conflict(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate_as(monkeypatch, "service_advisor")
    vehicle = build_vehicle_response()
    lookup = AsyncMock(return_value=vehicle)
    update = AsyncMock(
        side_effect=DuplicateRegistrationVinError("duplicate registration or VIN")
    )
    monkeypatch.setattr(vehicle_api, "get_vehicle_by_id", lookup)
    monkeypatch.setattr(vehicle_api, "update_vehicle", update)

    response = client.put(
        "/api/v1/vehicles/42",
        headers=authorization_header(),
        json=vehicle_payload(),
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "Registration/Vin number already exists"}
    update.assert_awaited_once()


def test_update_missing_vehicle_returns_not_found(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate_as(monkeypatch, "service_advisor")
    lookup = AsyncMock(return_value=None)
    update = AsyncMock()
    monkeypatch.setattr(vehicle_api, "get_vehicle_by_id", lookup)
    monkeypatch.setattr(vehicle_api, "update_vehicle", update)

    response = client.put(
        "/api/v1/vehicles/404",
        headers=authorization_header(),
        json=vehicle_payload(),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Vehicle not found."}
    update.assert_not_awaited()


def test_mechanic_cannot_update_vehicle(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate_as(monkeypatch, "mechanic")
    lookup = AsyncMock()
    update = AsyncMock()
    monkeypatch.setattr(vehicle_api, "get_vehicle_by_id", lookup)
    monkeypatch.setattr(vehicle_api, "update_vehicle", update)

    response = client.put(
        "/api/v1/vehicles/42",
        headers=authorization_header(),
        json=vehicle_payload(),
    )

    assert response.status_code == 403
    lookup.assert_not_awaited()
    update.assert_not_awaited()


def test_cors_preflight_allows_put_and_delete(client: TestClient) -> None:
    response = client.options(
        "/api/v1/vehicles/42",
        headers={
            "Origin": TEST_SETTINGS.cors_origins[0],
            "Access-Control-Request-Method": "PUT",
        },
    )

    assert response.status_code == 200
    allowed_methods = response.headers["access-control-allow-methods"]
    assert "PUT" in allowed_methods
    assert "DELETE" in allowed_methods
