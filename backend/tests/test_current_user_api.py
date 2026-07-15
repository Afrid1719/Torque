from collections.abc import AsyncGenerator
from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.api.dependencies import auth as auth_dependencies
from app.core.config import Settings, get_settings
from app.core.tokens import create_access_token
from app.db.models import Role, User
from app.db.session import get_db_session
from app.main import app

TEST_SETTINGS = Settings(
    APP_ENV="testing",
    JWT_SECRET_KEY=SecretStr("torque_current_user_test_secret_key_32_chars"),
)


async def override_db_session() -> AsyncGenerator[object, None]:
    yield object()


def override_settings() -> Settings:
    return TEST_SETTINGS


@pytest.fixture
def client() -> TestClient:
    app.dependency_overrides[get_db_session] = override_db_session
    app.dependency_overrides[get_settings] = override_settings
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def build_user(*, is_active: bool = True) -> User:
    return User(
        id=7,
        username="manager",
        password_hash="not-returned",
        is_active=is_active,
        role=Role(
            id=1,
            name="workshop_manager",
            display_name="Workshop Manager",
        ),
    )


def access_token(
    *,
    user_id: int = 7,
    role: str = "mechanic",
    issued_at: datetime | None = None,
) -> str:
    return create_access_token(
        user_id=user_id,
        role=role,
        settings=TEST_SETTINGS,
        issued_at=issued_at,
    ).value


def test_current_user_returns_database_identity_and_current_role(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    lookup = AsyncMock(return_value=build_user())
    monkeypatch.setattr(auth_dependencies, "get_user_by_id", lookup)

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token(role='mechanic')}"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": 7,
        "username": "manager",
        "role": {
            "id": 1,
            "name": "workshop_manager",
            "display_name": "Workshop Manager",
        },
    }
    assert "password_hash" not in response.text
    assert "mechanic" not in response.text
    assert lookup.await_args.args[1] == 7


@pytest.mark.parametrize(
    "headers",
    [
        {},
        {"Authorization": "Bearer invalid-token"},
        {"Authorization": "Basic credentials"},
    ],
)
def test_current_user_rejects_missing_or_invalid_credentials(
    client: TestClient,
    headers: dict[str, str],
) -> None:
    response = client.get("/api/v1/auth/me", headers=headers)

    assert response.status_code == 401
    assert response.json() == {"detail": "Could not validate credentials."}
    assert response.headers["www-authenticate"] == "Bearer"


def test_current_user_rejects_expired_token(client: TestClient) -> None:
    expired_token = access_token(issued_at=datetime.now(UTC) - timedelta(minutes=31))

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Could not validate credentials."}
    assert response.headers["www-authenticate"] == "Bearer"


@pytest.mark.parametrize("user", [None, build_user(is_active=False)])
def test_current_user_rejects_missing_or_inactive_database_user(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    user: User | None,
) -> None:
    monkeypatch.setattr(
        auth_dependencies,
        "get_user_by_id",
        AsyncMock(return_value=user),
    )

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token()}"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Could not validate credentials."}
    assert response.headers["www-authenticate"] == "Bearer"


def test_openapi_documents_current_user_bearer_authentication() -> None:
    schema = app.openapi()
    operation = schema["paths"]["/api/v1/auth/me"]["get"]
    serialized_operation = str(operation)

    assert operation["tags"] == ["authentication"]
    assert operation["security"] == [{"HTTPBearer": []}]
    assert "password_hash" not in serialized_operation
    assert "refresh_token" not in serialized_operation
