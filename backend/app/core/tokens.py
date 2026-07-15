import hashlib
import secrets
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt

from app.core.config import Settings


@dataclass(frozen=True)
class AccessToken:
    value: str
    expires_at: datetime


@dataclass(frozen=True)
class RefreshToken:
    raw_value: str
    token_hash: str


def create_access_token(
    user_id: int,
    role: str,
    settings: Settings,
    issued_at: datetime | None = None,
) -> AccessToken:
    issued_at = issued_at or datetime.now(UTC)
    expires_at = issued_at + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": issued_at,
        "exp": expires_at,
        "jti": uuid4().hex,
    }
    value = jwt.encode(
        payload,
        settings.jwt_secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )
    return AccessToken(value=value, expires_at=expires_at)


def hash_refresh_token(raw_value: str) -> str:
    return hashlib.sha256(raw_value.encode("utf-8")).hexdigest()


def create_refresh_token() -> RefreshToken:
    raw_value = secrets.token_urlsafe(48)
    return RefreshToken(
        raw_value=raw_value,
        token_hash=hash_refresh_token(raw_value),
    )
