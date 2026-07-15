from datetime import UTC, datetime

import jwt
from pydantic import SecretStr

from app.core.config import Settings
from app.core.tokens import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
)

TEST_SECRET = "torque_token_test_only_secret_key_32_chars"


def test_access_token_contains_only_required_claims() -> None:
    settings = Settings(
        JWT_SECRET_KEY=SecretStr(TEST_SECRET),
        ACCESS_TOKEN_EXPIRE_MINUTES=20,
    )
    issued_at = datetime.now(UTC).replace(microsecond=0)

    token = create_access_token(
        user_id=42,
        role="workshop_manager",
        settings=settings,
        issued_at=issued_at,
    )
    claims = jwt.decode(
        token.value,
        TEST_SECRET,
        algorithms=["HS256"],
        options={"require": ["sub", "iat", "exp", "jti"]},
    )

    assert set(claims) == {"sub", "role", "iat", "exp", "jti"}
    assert claims["sub"] == "42"
    assert claims["role"] == "workshop_manager"
    assert claims["exp"] - claims["iat"] == 20 * 60
    assert token.expires_at.timestamp() == claims["exp"]


def test_refresh_token_is_random_and_stored_as_hash() -> None:
    first = create_refresh_token()
    second = create_refresh_token()

    assert first.raw_value != second.raw_value
    assert first.token_hash != first.raw_value
    assert first.token_hash == hash_refresh_token(first.raw_value)
    assert len(first.token_hash) == 64
