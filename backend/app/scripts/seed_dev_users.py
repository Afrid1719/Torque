import asyncio

from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import get_settings
from app.core.dev_seed_config import get_development_seed_settings
from app.db.models import User
from app.db.session import AsyncSessionLocal, engine
from app.services.dev_seeding import (
    DevelopmentSeedEnvironmentError,
    ensure_development_environment,
    seed_development_users,
)


class DevelopmentSeedConfigurationError(RuntimeError):
    pass


async def run_seed() -> tuple[User, ...]:
    app_settings = get_settings()
    ensure_development_environment(app_settings.app_env)

    try:
        seed_settings = get_development_seed_settings()
    except ValidationError as exc:
        raise DevelopmentSeedConfigurationError(
            "Set all DEV_SEED_*_PASSWORD values to unique local passwords "
            "between 12 and 128 characters."
        ) from exc

    async with AsyncSessionLocal() as session:
        return await seed_development_users(
            session=session,
            app_env=app_settings.app_env,
            settings=seed_settings,
        )


async def run_seed_command() -> tuple[User, ...]:
    try:
        return await run_seed()
    finally:
        await engine.dispose()


def main() -> None:
    try:
        users = asyncio.run(run_seed_command())
    except (DevelopmentSeedConfigurationError, DevelopmentSeedEnvironmentError) as exc:
        raise SystemExit(str(exc)) from None
    except SQLAlchemyError:
        raise SystemExit(
            "Development user seeding failed. Verify MySQL and migration status."
        ) from None

    print("Development users created or updated:")
    for user in users:
        print(f"- {user.username} ({user.role.name})")


if __name__ == "__main__":
    main()
