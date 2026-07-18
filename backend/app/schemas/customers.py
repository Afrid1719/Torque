import re
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints, field_validator

CustomerName = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=150),
]
OptionalEmail = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=3, max_length=254),
]
OptionalAddress = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=500),
]
OptionalNotes = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=2000),
]

_EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
# Accept 7-15 digits with an optional leading `+`; spaces, hyphens, and
# parentheses are allowed for display formatting and removed before storage.
_MOBILE_SEPARATORS = str.maketrans("", "", " -()")


def normalize_mobile_number(value: str) -> str:
    normalized = value.strip().translate(_MOBILE_SEPARATORS)
    digits = normalized[1:] if normalized.startswith("+") else normalized
    if not digits.isdigit() or not 7 <= len(digits) <= 15:
        raise ValueError("Mobile number must contain between 7 and 15 digits.")
    return normalized


class CustomerCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: CustomerName
    mobile_number: str
    email: OptionalEmail | None = None
    address: OptionalAddress | None = None
    notes: OptionalNotes | None = None

    @field_validator("email", "address", "notes", mode="before")
    @classmethod
    def normalize_blank_optional_fields(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile_number(cls, value: str) -> str:
        return normalize_mobile_number(value)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is not None and _EMAIL_PATTERN.fullmatch(value) is None:
            raise ValueError("Email address is invalid.")
        return value.lower() if value is not None else None


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    mobile_number: str
    email: str | None
    address: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
