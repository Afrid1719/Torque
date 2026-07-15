import pytest
from pydantic import SecretStr

from app.core.config import Settings


def test_settings_builds_encoded_mysql_url_from_environment_values() -> None:
    settings = Settings(
        MYSQL_HOST="db.local",
        MYSQL_PORT=3307,
        MYSQL_DATABASE="torque test",
        MYSQL_USER="torque user",
        MYSQL_PASSWORD=SecretStr("p@ss word"),
    )

    assert settings.mysql_url == (
        "mysql+aiomysql://torque%20user:p%40ss%20word@db.local:3307/torque%20test"
    )


def test_api_prefix_must_start_with_slash() -> None:
    with pytest.raises(ValueError, match="API_V1_PREFIX"):
        Settings(API_V1_PREFIX="api/v1")


def test_mysql_port_must_be_valid() -> None:
    with pytest.raises(ValueError, match="MYSQL_PORT"):
        Settings(MYSQL_PORT=70000)


def test_cors_origins_can_be_read_from_comma_separated_environment_value() -> None:
    settings = Settings(
        CORS_ORIGINS="http://localhost:5173, http://127.0.0.1:5173",
    )

    assert settings.cors_origins == [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
