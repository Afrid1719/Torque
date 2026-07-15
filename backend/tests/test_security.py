import logging

import pytest

from app.core.security import hash_password, verify_password
from app.main import app

TEST_PASSWORD = "unit-test-password-only-123"


@pytest.fixture(scope="module")
def stored_hash() -> str:
    return hash_password(TEST_PASSWORD)


def test_hash_password_creates_argon2id_hash(stored_hash: str) -> None:
    assert stored_hash != TEST_PASSWORD
    assert stored_hash.startswith("$argon2id$")


def test_hash_password_uses_unique_salts(stored_hash: str) -> None:
    assert hash_password(TEST_PASSWORD) != stored_hash


def test_verify_password_accepts_matching_password(stored_hash: str) -> None:
    assert verify_password(TEST_PASSWORD, stored_hash) is True


def test_verify_password_rejects_incorrect_password(stored_hash: str) -> None:
    assert verify_password("incorrect-unit-test-password", stored_hash) is False


@pytest.mark.parametrize(
    "invalid_hash",
    [
        "not-a-password-hash",
        "$argon2id$v=19$m=invalid,t=3,p=4$invalid$invalid",
    ],
)
def test_verify_password_rejects_invalid_hash_safely(invalid_hash: str) -> None:
    assert verify_password(TEST_PASSWORD, invalid_hash) is False


def test_password_operations_do_not_log_sensitive_values(
    caplog: pytest.LogCaptureFixture,
    stored_hash: str,
) -> None:
    with caplog.at_level(logging.DEBUG):
        verify_password(TEST_PASSWORD, stored_hash)

    assert TEST_PASSWORD not in caplog.text
    assert stored_hash not in caplog.text


def test_openapi_does_not_expose_password_hash() -> None:
    assert "password_hash" not in str(app.openapi())
