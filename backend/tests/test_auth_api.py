from collections.abc import AsyncGenerator
from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.api.v1 import auth as auth_api
from app.core.config import Settings, get_settings
from app.db.session import get_db_session
from app.main import app
from app.services.auth import InvalidCredentialsError, LoginResult

TEST_SETTINGS = Settings(
    APP_ENV="testing",
    JWT_SECRET_KEY=SecretStr("torque_api_test_only_secret_key_32_chars"),
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


def test_login_returns_access_token_and_secure_refresh_cookie(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    refresh_expires_at = datetime.now(UTC) + timedelta(days=10)
    authenticate = AsyncMock(
        return_value=LoginResult(
            access_token="signed-access-token",
            access_token_expires_in=1800,
            refresh_token="raw-refresh-token",
            refresh_session_expires_at=refresh_expires_at,
        )
    )
    monkeypatch.setattr(auth_api, "authenticate_user", authenticate)

    response = client.post(
        "/api/v1/auth/login",
        json={"username": " manager ", "password": "test-password"},
        headers={"user-agent": "test-browser"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "access_token": "signed-access-token",
        "token_type": "bearer",
        "expires_in": 1800,
    }
    assert "raw-refresh-token" not in response.text
    cookie = response.headers["set-cookie"]
    assert "torque_refresh_token=raw-refresh-token" in cookie
    assert "HttpOnly" in cookie
    assert "Max-Age=864000" in cookie
    assert "Path=/api/v1/auth" in cookie
    assert "SameSite=lax" in cookie
    assert "Secure" in cookie
    assert authenticate.await_args.kwargs["username"] == "manager"
    assert authenticate.await_args.kwargs["user_agent"] == "test-browser"


def test_login_returns_same_controlled_error_without_cookie(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        auth_api,
        "authenticate_user",
        AsyncMock(side_effect=InvalidCredentialsError),
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"username": "unknown", "password": "incorrect"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid username or password."}
    assert response.headers["www-authenticate"] == "Bearer"
    assert "set-cookie" not in response.headers


@pytest.mark.parametrize(
    "payload",
    [
        {"username": "", "password": "password"},
        {"username": "manager", "password": ""},
        {"username": "manager", "password": "password", "role": "manager"},
    ],
)
def test_login_rejects_invalid_request_payload(
    client: TestClient,
    payload: dict[str, str],
) -> None:
    response = client.post("/api/v1/auth/login", json=payload)

    assert response.status_code == 422


def test_openapi_documents_login_without_sensitive_response_fields() -> None:
    schema = app.openapi()
    operation = schema["paths"]["/api/v1/auth/login"]["post"]
    serialized_operation = str(operation)

    assert operation["tags"] == ["authentication"]
    assert "password_hash" not in serialized_operation
    assert "refresh_token" not in serialized_operation
