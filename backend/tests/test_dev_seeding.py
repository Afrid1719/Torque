import asyncio
from unittest.mock import AsyncMock, MagicMock

import pytest
from pydantic import SecretStr, ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.authorization import require_roles
from app.core.config import Settings
from app.core.dev_seed_config import DevelopmentSeedSettings
from app.core.roles import RoleName
from app.core.security import verify_password
from app.core.tokens import decode_access_token
from app.db.models import Role, User
from app.scripts import seed_dev_users as seed_script
from app.scripts.seed_dev_users import DevelopmentSeedConfigurationError
from app.services import auth, dev_seeding
from app.services.auth import authenticate_user
from app.services.dev_seeding import (
    DevelopmentSeedEnvironmentError,
    seed_development_users,
)

PASSWORDS = {
    RoleName.WORKSHOP_MANAGER: "manager-local-password",
    RoleName.SERVICE_ADVISOR: "advisor-local-password",
    RoleName.MECHANIC: "mechanic-local-password",
}


def build_seed_settings() -> DevelopmentSeedSettings:
    return DevelopmentSeedSettings(
        workshop_manager_password=SecretStr(PASSWORDS[RoleName.WORKSHOP_MANAGER]),
        service_advisor_password=SecretStr(PASSWORDS[RoleName.SERVICE_ADVISOR]),
        mechanic_password=SecretStr(PASSWORDS[RoleName.MECHANIC]),
    )


def build_session() -> MagicMock:
    session = MagicMock(spec=AsyncSession)
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    return session


def test_seed_passwords_are_required_and_enforce_password_policy() -> None:
    with pytest.raises(ValidationError):
        DevelopmentSeedSettings(_env_file=None)

    with pytest.raises(ValidationError):
        DevelopmentSeedSettings(
            workshop_manager_password=SecretStr("short"),
            service_advisor_password=SecretStr("short"),
            mechanic_password=SecretStr("short"),
        )


def test_seed_rejects_non_development_environment_before_database_access() -> None:
    session = build_session()

    with pytest.raises(DevelopmentSeedEnvironmentError):
        asyncio.run(
            seed_development_users(
                session=session,
                app_env="production",
                settings=build_seed_settings(),
            )
        )

    session.add.assert_not_called()
    session.commit.assert_not_awaited()


def test_seed_creates_hashed_users_that_can_login_and_pass_role_checks(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = build_session()
    monkeypatch.setattr(
        dev_seeding,
        "get_role_by_name",
        AsyncMock(return_value=None),
    )
    monkeypatch.setattr(
        dev_seeding,
        "get_user_by_username",
        AsyncMock(return_value=None),
    )

    users = asyncio.run(
        seed_development_users(
            session=session,
            app_env="development",
            settings=build_seed_settings(),
        )
    )

    assert {user.username for user in users} == {
        "dev_manager",
        "dev_advisor",
        "dev_mechanic",
    }
    assert len(session.add.call_args_list) == 6
    session.commit.assert_awaited_once()
    session.rollback.assert_not_awaited()

    login_settings = Settings(
        APP_ENV="testing",
        JWT_SECRET_KEY=SecretStr("torque_dev_seed_login_test_secret_32_chars"),
    )
    for user_id, user in enumerate(users, start=1):
        role_name = RoleName(user.role.name)
        plain_password = PASSWORDS[role_name]
        user.id = user_id

        assert user.password_hash != plain_password
        assert user.password_hash.startswith("$argon2id$")
        assert verify_password(plain_password, user.password_hash)

        login_session = build_session()
        monkeypatch.setattr(
            auth,
            "get_user_by_username",
            AsyncMock(return_value=user),
        )
        login_result = asyncio.run(
            authenticate_user(
                session=login_session,
                username=user.username,
                plain_password=plain_password,
                settings=login_settings,
            )
        )
        claims = decode_access_token(login_result.access_token, login_settings)
        assert claims.user_id == user_id

        role_dependency = require_roles(role_name)
        assert asyncio.run(role_dependency(user)) is user


def test_seed_updates_existing_users_without_creating_duplicates(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = build_session()
    roles = [
        Role(name=role_name.value, display_name="Old Display Name")
        for role_name in RoleName
    ]
    users = [
        User(
            username=username,
            password_hash="old-hash",
            is_active=False,
            role=Role(name="old_role", display_name="Old Role"),
        )
        for username in ("dev_manager", "dev_advisor", "dev_mechanic")
    ]
    monkeypatch.setattr(
        dev_seeding,
        "get_role_by_name",
        AsyncMock(side_effect=roles),
    )
    monkeypatch.setattr(
        dev_seeding,
        "get_user_by_username",
        AsyncMock(side_effect=users),
    )

    seeded_users = asyncio.run(
        seed_development_users(
            session=session,
            app_env="development",
            settings=build_seed_settings(),
        )
    )

    session.add.assert_not_called()
    session.commit.assert_awaited_once()
    for role, user, expected_role in zip(roles, seeded_users, RoleName, strict=True):
        assert role.display_name != "Old Display Name"
        assert user.is_active is True
        assert user.role is role
        assert verify_password(PASSWORDS[expected_role], user.password_hash)


def test_seed_rolls_back_database_failure(monkeypatch: pytest.MonkeyPatch) -> None:
    session = build_session()
    session.commit.side_effect = SQLAlchemyError("database unavailable")
    monkeypatch.setattr(
        dev_seeding,
        "get_role_by_name",
        AsyncMock(return_value=None),
    )
    monkeypatch.setattr(
        dev_seeding,
        "get_user_by_username",
        AsyncMock(return_value=None),
    )

    with pytest.raises(SQLAlchemyError):
        asyncio.run(
            seed_development_users(
                session=session,
                app_env="development",
                settings=build_seed_settings(),
            )
        )

    session.rollback.assert_awaited_once()


def test_seed_command_rejects_production_before_loading_passwords(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    password_loader = MagicMock()
    monkeypatch.setattr(
        seed_script,
        "get_settings",
        lambda: Settings(
            APP_ENV="production",
            JWT_SECRET_KEY=SecretStr("torque_seed_production_test_secret_32_chars"),
        ),
    )
    monkeypatch.setattr(
        seed_script,
        "get_development_seed_settings",
        password_loader,
    )

    with pytest.raises(DevelopmentSeedEnvironmentError):
        asyncio.run(seed_script.run_seed())

    password_loader.assert_not_called()


def test_seed_command_replaces_validation_details_with_controlled_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        seed_script,
        "get_settings",
        lambda: Settings(
            APP_ENV="development",
            JWT_SECRET_KEY=SecretStr("torque_seed_config_test_secret_key_32_chars"),
        ),
    )

    def invalid_seed_settings() -> DevelopmentSeedSettings:
        return DevelopmentSeedSettings(_env_file=None)

    monkeypatch.setattr(
        seed_script,
        "get_development_seed_settings",
        invalid_seed_settings,
    )

    with pytest.raises(DevelopmentSeedConfigurationError) as exc_info:
        asyncio.run(seed_script.run_seed())

    assert "DEV_SEED_*_PASSWORD" in str(exc_info.value)
    assert "input_value" not in str(exc_info.value)


def test_seed_command_disposes_database_engine(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    seeded_users: tuple[User, ...] = ()
    engine = MagicMock()
    engine.dispose = AsyncMock()
    monkeypatch.setattr(
        seed_script,
        "run_seed",
        AsyncMock(return_value=seeded_users),
    )
    monkeypatch.setattr(seed_script, "engine", engine)

    result = asyncio.run(seed_script.run_seed_command())

    assert result == seeded_users
    engine.dispose.assert_awaited_once()
