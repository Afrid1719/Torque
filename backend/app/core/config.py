from functools import lru_cache
from typing import Literal
from urllib.parse import quote

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="TORQUE API", alias="APP_NAME")
    app_env: Literal["development", "testing", "production"] = Field(
        default="development",
        alias="APP_ENV",
    )
    debug: bool = Field(default=True, alias="DEBUG")
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")
    cors_origins: list[str] = Field(
        default=["http://localhost:5173", "http://127.0.0.1:5173"],
        alias="CORS_ORIGINS",
    )

    mysql_host: str = Field(default="127.0.0.1", alias="MYSQL_HOST")
    mysql_port: int = Field(default=3306, alias="MYSQL_PORT")
    mysql_database: str = Field(default="torque_db", alias="MYSQL_DATABASE")
    mysql_user: str = Field(default="torque_user", alias="MYSQL_USER")
    mysql_password: SecretStr = Field(
        default=SecretStr("change_me"), alias="MYSQL_PASSWORD"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    @field_validator("api_v1_prefix")
    @classmethod
    def validate_api_prefix(cls, value: str) -> str:
        if not value.startswith("/"):
            raise ValueError("API_V1_PREFIX must start with '/'.")
        return value.rstrip("/")

    @field_validator("mysql_port")
    @classmethod
    def validate_mysql_port(cls, value: int) -> int:
        if value <= 0 or value > 65535:
            raise ValueError("MYSQL_PORT must be between 1 and 65535.")
        return value

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: list[str] | str) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def is_testing(self) -> bool:
        return self.app_env == "testing"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def mysql_url(self) -> str:
        user = quote(self.mysql_user, safe="")
        password = quote(self.mysql_password.get_secret_value(), safe="")
        database = quote(self.mysql_database, safe="")

        return (
            f"mysql+aiomysql://{user}:"
            f"{password}@{self.mysql_host}:"
            f"{self.mysql_port}/{database}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
