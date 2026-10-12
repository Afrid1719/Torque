from datetime import date
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.schemas.vehicles import VehicleCreate, VehicleCreateResponse


def valid_vehicle_data() -> dict[str, object]:
    return {
        "registration_number": "MH12AB1234",
        "make": "Maruti",
        "model": "Swift",
        "variant": "VXI",
        "vehicle_type": "private",
        "fuel_type": "petrol",
        "transmission": "manual",
        "color": "White",
        "vin": "1HGCM82633A004352",
        "odometer": 25000,
        "manufacture_year": 2022,
        "engine_capacity": 1197,
    }


def test_vehicle_create_accepts_valid_payload_and_applies_defaults() -> None:
    vehicle = VehicleCreate.model_validate(valid_vehicle_data())

    assert vehicle.registration_number == "MH12AB1234"
    assert vehicle.vehicle_type == "PRIVATE"
    assert vehicle.is_active is True


def test_vehicle_create_normalizes_text_fields() -> None:
    data = valid_vehicle_data()
    data.update(
        {
            "registration_number": " mh12ab1234 ",
            "make": " maruti ",
            "model": " swift ",
            "variant": " vxi ",
            "vehicle_type": " private ",
            "fuel_type": " petrol ",
            "transmission": " manual ",
            "color": " white ",
            "vin": "1hgcm82633a004352",
        }
    )

    vehicle = VehicleCreate.model_validate(data)

    assert vehicle.model_dump() == {
        "registration_number": "MH12AB1234",
        "make": "MARUTI",
        "model": "SWIFT",
        "variant": "VXI",
        "vehicle_type": "PRIVATE",
        "fuel_type": "PETROL",
        "transmission": "MANUAL",
        "color": "WHITE",
        "vin": "1HGCM82633A004352",
        "odometer": 25000,
        "is_active": True,
        "manufacture_year": 2022,
        "engine_capacity": 1197,
    }


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("registration_number", "INVALID"),
        ("registration_number", "MH12ABCDE"),
        ("make", "M"),
        ("model", "AB"),
        ("variant", ""),
        ("vehicle_type", "motorcycle"),
        ("odometer", 0),
        ("vin", "1HGCM82633A00435I"),
        ("vin", "1HGCM82633A00435"),
        ("manufacture_year", 1969),
        ("manufacture_year", date.today().year + 1),
        ("engine_capacity", 997),
    ],
)
def test_vehicle_create_rejects_invalid_field_values(field: str, value: object) -> None:
    data = valid_vehicle_data()
    data[field] = value

    with pytest.raises(ValidationError):
        VehicleCreate.model_validate(data)


def test_vehicle_create_accepts_nullable_optional_values() -> None:
    data = valid_vehicle_data()
    data["manufacture_year"] = None
    data["engine_capacity"] = None

    vehicle = VehicleCreate.model_validate(data)

    assert vehicle.manufacture_year is None
    assert vehicle.engine_capacity is None


def test_vehicle_create_rejects_non_string_text_fields() -> None:
    data = valid_vehicle_data()
    data["make"] = 123

    with pytest.raises(ValidationError, match="Field must be a string"):
        VehicleCreate.model_validate(data)


def test_vehicle_create_rejects_coerced_types_and_unknown_fields() -> None:
    data = valid_vehicle_data()
    data["odometer"] = "25000"

    with pytest.raises(ValidationError):
        VehicleCreate.model_validate(data)

    data = valid_vehicle_data()
    data["unknown"] = "value"
    with pytest.raises(ValidationError):
        VehicleCreate.model_validate(data)


def test_vehicle_create_requires_nullable_fields_to_be_present() -> None:
    data = valid_vehicle_data()
    del data["manufacture_year"]
    del data["engine_capacity"]

    with pytest.raises(ValidationError):
        VehicleCreate.model_validate(data)


def test_vehicle_create_response_reads_attributes() -> None:
    attributes = {
        "id": 1,
        **valid_vehicle_data(),
        "is_active": True,
    }
    response = VehicleCreateResponse.model_validate(SimpleNamespace(**attributes))

    assert response.id == 1
    assert response.registration_number == "MH12AB1234"
