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


@pytest.mark.parametrize("minutes", [14, 31])
def test_access_token_expiry_must_stay_within_mvp_range(minutes: int) -> None:
    with pytest.raises(ValueError, match="ACCESS_TOKEN_EXPIRE_MINUTES"):
        Settings(ACCESS_TOKEN_EXPIRE_MINUTES=minutes)


def test_jwt_secret_must_be_at_least_32_characters() -> None:
    with pytest.raises(ValueError, match="JWT_SECRET_KEY"):
        Settings(JWT_SECRET_KEY=SecretStr("too-short"))


def test_refresh_cookie_security_depends_on_environment() -> None:
    development = Settings(APP_ENV="development")
    testing = Settings(APP_ENV="testing")

    assert development.refresh_cookie_secure is False
    assert testing.refresh_cookie_secure is True
    assert testing.refresh_cookie_path == "/api/v1/auth"
    assert testing.refresh_session_expire_seconds == 864000
    assert testing.remembered_refresh_session_expire_seconds == 2592000


def test_refresh_session_expiry_accepts_environment_string() -> None:
    settings = Settings(REFRESH_SESSION_EXPIRE_DAYS="10")

    assert settings.refresh_session_expire_days == 10
    assert settings.remembered_refresh_session_expire_days == 30
