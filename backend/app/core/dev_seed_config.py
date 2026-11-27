from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class DevelopmentSeedSettings(BaseSettings):
    workshop_manager_password: SecretStr = Field(
        alias="DEV_SEED_WORKSHOP_MANAGER_PASSWORD",
        min_length=12,
        max_length=128,
    )
    service_advisor_password: SecretStr = Field(
        alias="DEV_SEED_SERVICE_ADVISOR_PASSWORD",
        min_length=12,
        max_length=128,
    )
    mechanic_password: SecretStr = Field(
        alias="DEV_SEED_MECHANIC_PASSWORD",
        min_length=12,
        max_length=128,
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )


def get_development_seed_settings() -> DevelopmentSeedSettings:
    # BaseSettings supplies required values from environment sources at runtime.
    return DevelopmentSeedSettings()  # pyright: ignore[reportCallIssue]
