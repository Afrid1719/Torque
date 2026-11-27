from collections.abc import AsyncGenerator
from typing import Annotated
from unittest.mock import AsyncMock

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.api.dependencies import auth as auth_dependencies
from app.api.dependencies.authorization import (
    MechanicUser,
    ServiceAdvisorUser,
    WorkshopManagerUser,
    require_roles,
)
from app.core.config import Settings, get_settings
from app.core.roles import RoleName
from app.core.tokens import create_access_token
from app.db.models import Role, User
from app.db.session import get_db_session

TEST_SETTINGS = Settings(
    APP_ENV="testing",
    JWT_SECRET_KEY=SecretStr("torque_authorization_test_secret_key_32_chars"),
)

ServiceTeamUser = Annotated[
    User,
    Depends(
        require_roles(
            RoleName.WORKSHOP_MANAGER,
            RoleName.SERVICE_ADVISOR,
        )
    ),
]

rbac_app = FastAPI()


@rbac_app.get("/manager")
async def manager_operation(current_user: WorkshopManagerUser) -> dict[str, str]:
    return {"username": current_user.username}


@rbac_app.get("/service-advisor")
async def service_advisor_operation(
    current_user: ServiceAdvisorUser,
) -> dict[str, str]:
    return {"username": current_user.username}


@rbac_app.get("/mechanic")
async def mechanic_operation(current_user: MechanicUser) -> dict[str, str]:
    return {"username": current_user.username}


@rbac_app.get("/service-team")
async def service_team_operation(current_user: ServiceTeamUser) -> dict[str, str]:
    return {"username": current_user.username}


async def override_db_session() -> AsyncGenerator[object, None]:
    yield object()


def override_settings() -> Settings:
    return TEST_SETTINGS


@pytest.fixture
def client() -> TestClient:
    rbac_app.dependency_overrides[get_db_session] = override_db_session
    rbac_app.dependency_overrides[get_settings] = override_settings
    with TestClient(rbac_app) as test_client:
        yield test_client
    rbac_app.dependency_overrides.clear()


def build_user(role_name: str) -> User:
    return User(
        id=7,
        username="test-user",
        password_hash="not-returned",
        is_active=True,
        role=Role(
            id=1,
            name=role_name,
            display_name="Test Role",
        ),
    )


def authorization_header() -> dict[str, str]:
    token = create_access_token(
        user_id=7,
        role="stale_token_role",
        settings=TEST_SETTINGS,
    )
    return {"Authorization": f"Bearer {token.value}"}


@pytest.mark.parametrize(
    ("path", "role_name"),
    [
        ("/manager", RoleName.WORKSHOP_MANAGER),
        ("/service-advisor", RoleName.SERVICE_ADVISOR),
        ("/mechanic", RoleName.MECHANIC),
    ],
)
def test_each_supported_role_can_access_its_protected_operation(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    path: str,
    role_name: RoleName,
) -> None:
    monkeypatch.setattr(
        auth_dependencies,
        "get_user_by_id",
        AsyncMock(return_value=build_user(role_name)),
    )

    response = client.get(path, headers=authorization_header())

    assert response.status_code == 200
    assert response.json() == {"username": "test-user"}


def test_protected_operation_rejects_unauthenticated_request(
    client: TestClient,
) -> None:
    response = client.get("/manager")

    assert response.status_code == 401
    assert response.json() == {"detail": "Could not validate credentials."}
    assert response.headers["www-authenticate"] == "Bearer"


def test_protected_operation_rejects_authenticated_wrong_role(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        auth_dependencies,
        "get_user_by_id",
        AsyncMock(return_value=build_user(RoleName.MECHANIC)),
    )

    response = client.get("/manager", headers=authorization_header())

    assert response.status_code == 403
    assert response.json() == {"detail": "Insufficient permissions."}
    assert "workshop_manager" not in response.text
    assert "mechanic" not in response.text
    assert "www-authenticate" not in response.headers


@pytest.mark.parametrize(
    "role_name",
    [RoleName.WORKSHOP_MANAGER, RoleName.SERVICE_ADVISOR],
)
def test_multi_role_operation_allows_each_configured_role(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    role_name: RoleName,
) -> None:
    monkeypatch.setattr(
        auth_dependencies,
        "get_user_by_id",
        AsyncMock(return_value=build_user(role_name)),
    )

    response = client.get("/service-team", headers=authorization_header())

    assert response.status_code == 200


def test_unknown_database_role_is_denied_by_default(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        auth_dependencies,
        "get_user_by_id",
        AsyncMock(return_value=build_user("unknown_role")),
    )

    response = client.get("/manager", headers=authorization_header())

    assert response.status_code == 403
    assert response.json() == {"detail": "Insufficient permissions."}
    assert "unknown_role" not in response.text


def test_role_dependency_requires_at_least_one_allowed_role() -> None:
    with pytest.raises(ValueError, match="At least one allowed role"):
        require_roles()
