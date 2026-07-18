import pytest
from pydantic import ValidationError

from app.schemas.customers import CustomerCreate


def test_customer_create_normalizes_input() -> None:
    payload = CustomerCreate(
        name="  Asha Rao  ",
        mobile_number=" +91 (98765) 43210 ",
        email=" ASHA@example.com ",
        address="  14 Market Road  ",
        notes="  Prefers WhatsApp  ",
    )

    assert payload.model_dump() == {
        "name": "Asha Rao",
        "mobile_number": "+919876543210",
        "email": "asha@example.com",
        "address": "14 Market Road",
        "notes": "Prefers WhatsApp",
    }


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("name", "   "),
        ("mobile_number", "123"),
        ("mobile_number", "not-a-phone"),
        ("email", "invalid-email"),
    ],
)
def test_customer_create_rejects_invalid_fields(field: str, value: str) -> None:
    data = {"name": "Asha Rao", "mobile_number": "9876543210"}
    data[field] = value

    with pytest.raises(ValidationError):
        CustomerCreate.model_validate(data)


def test_customer_create_rejects_unknown_fields() -> None:
    with pytest.raises(ValidationError):
        CustomerCreate(
            name="Asha Rao",
            mobile_number="9876543210",
            vehicle_registration="KA01AB1234",  # type: ignore[call-arg]
        )
