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
from app.services.auth import (
    InvalidCredentialsError,
    InvalidRefreshSessionError,
    LoginResult,
    RefreshResult,
)

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
    refresh_expires_at = datetime.now(UTC) + timedelta(days=30)
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
        json={
            "username": " manager ",
            "password": "test-password",
            "remember_me": True,
        },
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
    assert "Max-Age=2592000" in cookie
    assert "Path=/api/v1/auth" in cookie
    assert "SameSite=lax" in cookie
    assert "Secure" in cookie
    assert authenticate.await_args.kwargs["username"] == "manager"
    assert authenticate.await_args.kwargs["remember_me"] is True
    assert authenticate.await_args.kwargs["user_agent"] == "test-browser"


def test_login_uses_browser_session_cookie_when_device_is_not_remembered(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    authenticate = AsyncMock(
        return_value=LoginResult(
            access_token="signed-access-token",
            access_token_expires_in=1800,
            refresh_token="raw-refresh-token",
            refresh_session_expires_at=datetime.now(UTC) + timedelta(days=10),
        )
    )
    monkeypatch.setattr(auth_api, "authenticate_user", authenticate)

    response = client.post(
        "/api/v1/auth/login",
        json={"username": "manager", "password": "test-password"},
    )

    assert response.status_code == 200
    cookie = response.headers["set-cookie"]
    assert "Max-Age" not in cookie
    assert "expires=" not in cookie.lower()
    assert authenticate.await_args.kwargs["remember_me"] is False


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


def test_refresh_returns_new_access_token_from_httponly_session_cookie(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    refresh = AsyncMock(
        return_value=RefreshResult(
            access_token="refreshed-access-token",
            access_token_expires_in=1800,
        )
    )
    monkeypatch.setattr(auth_api, "refresh_access_token", refresh)
    client.cookies.set("torque_refresh_token", "raw-refresh-token")

    response = client.post(
        "/api/v1/auth/refresh",
        headers={"Origin": "http://localhost:5173"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "access_token": "refreshed-access-token",
        "token_type": "bearer",
        "expires_in": 1800,
    }
    assert "raw-refresh-token" not in response.text
    assert refresh.await_args.kwargs["raw_refresh_token"] == "raw-refresh-token"


@pytest.mark.parametrize(
    "configure_cookie",
    [False, True],
    ids=["missing-cookie", "invalid-session"],
)
def test_refresh_rejects_invalid_session_and_clears_cookie(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    configure_cookie: bool,
) -> None:
    refresh = AsyncMock(side_effect=InvalidRefreshSessionError)
    monkeypatch.setattr(auth_api, "refresh_access_token", refresh)
    if configure_cookie:
        client.cookies.set("torque_refresh_token", "invalid-refresh-token")

    response = client.post(
        "/api/v1/auth/refresh",
        headers={"Origin": "http://localhost:5173"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Could not refresh session."}
    assert response.headers["www-authenticate"] == "Bearer"
    cookie = response.headers["set-cookie"]
    assert 'torque_refresh_token=""' in cookie
    assert "Max-Age=0" in cookie
    assert "Path=/api/v1/auth" in cookie
    assert "HttpOnly" in cookie
    assert "Secure" in cookie
    assert refresh.await_count == int(configure_cookie)


@pytest.mark.parametrize("origin", [None, "https://untrusted.example"])
def test_refresh_rejects_missing_or_disallowed_origin(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    origin: str | None,
) -> None:
    refresh = AsyncMock()
    monkeypatch.setattr(auth_api, "refresh_access_token", refresh)
    client.cookies.set("torque_refresh_token", "raw-refresh-token")
    headers = {"Origin": origin} if origin is not None else {}

    response = client.post("/api/v1/auth/refresh", headers=headers)

    assert response.status_code == 403
    assert response.json() == {"detail": "Request origin is not allowed."}
    refresh.assert_not_awaited()


def test_logout_revokes_session_and_clears_refresh_cookie(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    revoke = AsyncMock()
    monkeypatch.setattr(auth_api, "revoke_refresh_session", revoke)
    client.cookies.set("torque_refresh_token", "raw-refresh-token")

    response = client.post(
        "/api/v1/auth/logout",
        headers={"Origin": "http://localhost:5173"},
    )

    assert response.status_code == 204
    assert response.content == b""
    assert revoke.await_args.kwargs["raw_refresh_token"] == "raw-refresh-token"
    cookie = response.headers["set-cookie"]
    assert 'torque_refresh_token=""' in cookie
    assert "Max-Age=0" in cookie
    assert "Path=/api/v1/auth" in cookie
    assert "HttpOnly" in cookie
    assert "Secure" in cookie


def test_logout_without_cookie_remains_idempotent_and_clears_cookie(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    revoke = AsyncMock()
    monkeypatch.setattr(auth_api, "revoke_refresh_session", revoke)

    response = client.post(
        "/api/v1/auth/logout",
        headers={"Origin": "http://localhost:5173"},
    )

    assert response.status_code == 204
    revoke.assert_not_awaited()
    assert "Max-Age=0" in response.headers["set-cookie"]


@pytest.mark.parametrize("origin", [None, "https://untrusted.example"])
def test_logout_rejects_missing_or_disallowed_origin(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    origin: str | None,
) -> None:
    revoke = AsyncMock()
    monkeypatch.setattr(auth_api, "revoke_refresh_session", revoke)
    client.cookies.set("torque_refresh_token", "raw-refresh-token")
    headers = {"Origin": origin} if origin is not None else {}

    response = client.post("/api/v1/auth/logout", headers=headers)

    assert response.status_code == 403
    assert response.json() == {"detail": "Request origin is not allowed."}
    revoke.assert_not_awaited()
