from dataclasses import dataclass

from pydantic import SecretStr
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dev_seed_config import DevelopmentSeedSettings
from app.core.roles import RoleName
from app.core.security import hash_password
from app.db.models import Role, User
from app.repositories.roles import get_role_by_name
from app.repositories.users import get_user_by_username


class DevelopmentSeedEnvironmentError(RuntimeError):
    pass


@dataclass(frozen=True)
class DevelopmentUserSpec:
    username: str
    role_name: RoleName
    role_display_name: str
    password: SecretStr


def development_user_specs(
    settings: DevelopmentSeedSettings,
) -> tuple[DevelopmentUserSpec, ...]:
    return (
        DevelopmentUserSpec(
            username="dev_manager",
            role_name=RoleName.WORKSHOP_MANAGER,
            role_display_name="Workshop Manager",
            password=settings.workshop_manager_password,
        ),
        DevelopmentUserSpec(
            username="dev_advisor",
            role_name=RoleName.SERVICE_ADVISOR,
            role_display_name="Service Advisor",
            password=settings.service_advisor_password,
        ),
        DevelopmentUserSpec(
            username="dev_mechanic",
            role_name=RoleName.MECHANIC,
            role_display_name="Mechanic",
            password=settings.mechanic_password,
        ),
    )


def ensure_development_environment(app_env: str) -> None:
    if app_env != "development":
        raise DevelopmentSeedEnvironmentError(
            "Development user seeding requires APP_ENV=development."
        )


async def seed_development_users(
    session: AsyncSession,
    app_env: str,
    settings: DevelopmentSeedSettings,
) -> tuple[User, ...]:
    ensure_development_environment(app_env)
    seeded_users: list[User] = []

    try:
        for spec in development_user_specs(settings):
            role = await get_role_by_name(session, spec.role_name.value)
            if role is None:
                role = Role(
                    name=spec.role_name.value,
                    display_name=spec.role_display_name,
                )
                session.add(role)
            else:
                role.display_name = spec.role_display_name

            user = await get_user_by_username(session, spec.username)
            password_hash = hash_password(spec.password.get_secret_value())
            if user is None:
                user = User(
                    username=spec.username,
                    password_hash=password_hash,
                    is_active=True,
                    role=role,
                )
                session.add(user)
            else:
                user.password_hash = password_hash
                user.is_active = True
                user.role = role

            seeded_users.append(user)

        await session.commit()
    except SQLAlchemyError:
        await session.rollback()
        raise

    return tuple(seeded_users)
