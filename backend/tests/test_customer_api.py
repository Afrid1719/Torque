from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.api.dependencies import auth as auth_dependencies
from app.api.v1 import customers as customer_api
from app.core.config import Settings, get_settings
from app.core.tokens import create_access_token
from app.db.models import Customer, Role, User
from app.db.session import get_db_session
from app.main import app
from app.services.customers import DuplicateMobileNumberError

TEST_SETTINGS = Settings(
    APP_ENV="testing",
    JWT_SECRET_KEY=SecretStr("torque_customer_api_test_secret_32_chars"),
)
NOW = datetime(2026, 7, 18, 15, 0, tzinfo=UTC)


async def override_db_session() -> AsyncGenerator[object, None]:
    yield object()


@pytest.fixture
def client() -> TestClient:
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
        role=Role(id=1, name=role_name, display_name=role_name.replace("_", " ")),
    )


def build_customer() -> Customer:
    return Customer(
        id=23,
        name="Asha Rao",
        mobile_number="+919876543210",
        email="asha@example.com",
        address="14 Market Road",
        notes="Prefers WhatsApp",
        created_at=NOW,
        updated_at=NOW,
    )


def token() -> str:
    return create_access_token(
        user_id=7,
        role="mechanic",
        settings=TEST_SETTINGS,
        issued_at=datetime.now(UTC),
    ).value


def authenticate_as(monkeypatch: pytest.MonkeyPatch, role_name: str) -> None:
    monkeypatch.setattr(
        auth_dependencies,
        "get_user_by_id",
        AsyncMock(return_value=build_user(role_name)),
    )


@pytest.mark.parametrize("role_name", ["workshop_manager", "service_advisor"])
def test_authorized_staff_can_create_customer(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    role_name: str,
) -> None:
    authenticate_as(monkeypatch, role_name)
    create = AsyncMock(return_value=build_customer())
    monkeypatch.setattr(customer_api, "create_customer", create)

    response = client.post(
        "/api/v1/customers",
        headers={"Authorization": f"Bearer {token()}"},
        json={
            "name": " Asha Rao ",
            "mobile_number": "+91 98765-43210",
            "email": "ASHA@example.com",
            "address": "14 Market Road",
            "notes": "Prefers WhatsApp",
        },
    )

    assert response.status_code == 201
    assert response.json()["id"] == 23
    assert response.json()["mobile_number"] == "+919876543210"
    payload = create.await_args.args[1]
    assert payload.mobile_number == "+919876543210"
    assert payload.email == "asha@example.com"


def test_mechanic_cannot_create_customer(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate_as(monkeypatch, "mechanic")
    create = AsyncMock()
    monkeypatch.setattr(customer_api, "create_customer", create)

    response = client.post(
        "/api/v1/customers",
        headers={"Authorization": f"Bearer {token()}"},
        json={"name": "Asha Rao", "mobile_number": "9876543210"},
    )

    assert response.status_code == 403
    assert response.json() == {"detail": "Insufficient permissions."}
    create.assert_not_awaited()


def test_create_customer_requires_authentication(client: TestClient) -> None:
    response = client.post(
        "/api/v1/customers",
        json={"name": "Asha Rao", "mobile_number": "9876543210"},
    )

    assert response.status_code == 401


def test_create_customer_validates_required_fields(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate_as(monkeypatch, "service_advisor")

    response = client.post(
        "/api/v1/customers",
        headers={"Authorization": f"Bearer {token()}"},
        json={"name": " ", "mobile_number": "9876543210"},
    )

    assert response.status_code == 422


def test_duplicate_mobile_number_returns_conflict(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate_as(monkeypatch, "service_advisor")
    monkeypatch.setattr(
        customer_api,
        "create_customer",
        AsyncMock(side_effect=DuplicateMobileNumberError),
    )

    response = client.post(
        "/api/v1/customers",
        headers={"Authorization": f"Bearer {token()}"},
        json={"name": "Asha Rao", "mobile_number": "9876543210"},
    )

    assert response.status_code == 409
    assert response.json() == {
        "detail": "A customer with this mobile number already exists."
    }


def test_authorized_staff_can_get_created_customer(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate_as(monkeypatch, "workshop_manager")
    lookup = AsyncMock(return_value=build_customer())
    monkeypatch.setattr(customer_api, "get_customer_by_id", lookup)

    response = client.get(
        "/api/v1/customers/23",
        headers={"Authorization": f"Bearer {token()}"},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Asha Rao"
    assert lookup.await_args.args[1] == 23


def test_missing_customer_returns_not_found(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate_as(monkeypatch, "service_advisor")
    monkeypatch.setattr(
        customer_api,
        "get_customer_by_id",
        AsyncMock(return_value=None),
    )

    response = client.get(
        "/api/v1/customers/999",
        headers={"Authorization": f"Bearer {token()}"},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Customer not found."}
