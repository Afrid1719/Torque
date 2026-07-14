import asyncio

import pytest
from fastapi import HTTPException

from app.api.v1 import health
from app.db.health import DatabaseUnavailableError


def test_health_check_returns_api_status() -> None:
    assert asyncio.run(health.health_check()) == {
        "status": "ok",
        "service": "torque-api",
    }


def test_database_health_check_returns_ok_when_query_succeeds(monkeypatch) -> None:
    async def fake_check_database_connection(session) -> bool:
        return True

    monkeypatch.setattr(
        health,
        "check_database_connection",
        fake_check_database_connection,
    )

    assert asyncio.run(health.database_health_check(session=object())) == {
        "status": "ok",
        "service": "torque-database",
    }


def test_database_health_check_returns_sanitized_503(monkeypatch) -> None:
    async def fake_check_database_connection(session) -> bool:
        raise DatabaseUnavailableError("contains sensitive driver detail")

    monkeypatch.setattr(
        health,
        "check_database_connection",
        fake_check_database_connection,
    )

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(health.database_health_check(session=object()))

    assert exc_info.value.status_code == 503
    assert exc_info.value.detail == {
        "status": "unavailable",
        "service": "torque-database",
        "message": "Database connectivity check failed.",
    }
