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

    jwt_secret_key: SecretStr = Field(
        alias="JWT_SECRET_KEY",
        min_length=32,
    )
    jwt_algorithm: Literal["HS256"] = Field(
        default="HS256",
        alias="JWT_ALGORITHM",
    )
    access_token_expire_minutes: int = Field(
        default=30,
        alias="ACCESS_TOKEN_EXPIRE_MINUTES",
        ge=15,
        le=30,
    )
    refresh_session_expire_days: int = Field(
        default=10,
        alias="REFRESH_SESSION_EXPIRE_DAYS",
        ge=10,
        le=10,
    )
    remembered_refresh_session_expire_days: int = Field(
        default=30,
        alias="REMEMBERED_REFRESH_SESSION_EXPIRE_DAYS",
        ge=30,
        le=30,
    )
    refresh_cookie_name: str = Field(
        default="torque_refresh_token",
        alias="REFRESH_COOKIE_NAME",
        min_length=1,
        max_length=64,
        pattern=r"^[A-Za-z0-9_-]+$",
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
    def refresh_cookie_secure(self) -> bool:
        return not self.is_development

    @property
    def refresh_cookie_path(self) -> str:
        return f"{self.api_v1_prefix}/auth"

    @property
    def access_token_expire_seconds(self) -> int:
        return self.access_token_expire_minutes * 60

    @property
    def refresh_session_expire_seconds(self) -> int:
        return self.refresh_session_expire_days * 24 * 60 * 60

    @property
    def remembered_refresh_session_expire_seconds(self) -> int:
        return self.remembered_refresh_session_expire_days * 24 * 60 * 60

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
    # BaseSettings supplies required values from environment sources at runtime.
    return Settings()  # pyright: ignore[reportCallIssue]
