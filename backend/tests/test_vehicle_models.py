from sqlalchemy import CheckConstraint, ForeignKeyConstraint, UniqueConstraint

from app.db.base import Base
from app.db.models.vehicles import Vehicle


def test_vehicle_table_has_expected_columns_and_timestamps() -> None:
    table = Base.metadata.tables["vehicles"]

    assert Vehicle.__tablename__ == table.name
    assert set(table.columns.keys()) == {
        "id",
        "cust_id",
        "registration_number",
        "make",
        "model",
        "variant",
        "vehicle_type",
        "fuel_type",
        "transmission",
        "color",
        "vin",
        "odometer",
        "is_active",
        "manufacture_year",
        "engine_capacity",
        "created_at",
        "updated_at",
    }
    assert table.c.id.primary_key
    assert table.c.created_at.nullable is False
    assert table.c.updated_at.nullable is False


def test_vehicle_registration_number_is_unique_and_required() -> None:
    table = Base.metadata.tables["vehicles"]
    unique_constraints = {
        tuple(column.name for column in constraint.columns)
        for constraint in table.constraints
        if isinstance(constraint, UniqueConstraint)
    }

    assert ("registration_number",) in unique_constraints
    assert table.c.registration_number.nullable is False


def test_vehicle_customer_reference_sets_null_on_delete() -> None:
    table = Base.metadata.tables["vehicles"]
    foreign_key = next(
        constraint
        for constraint in table.constraints
        if isinstance(constraint, ForeignKeyConstraint)
    )

    assert foreign_key.column_keys == ["cust_id"]
    assert [element.target_fullname for element in foreign_key.elements] == [
        "customers.id"
    ]
    assert foreign_key.ondelete == "SET NULL"
    assert foreign_key.onupdate == "CASCADE"
    assert table.c.cust_id.nullable is True


def test_vehicle_model_has_business_check_constraints() -> None:
    constraints = {
        constraint.name: str(constraint.sqltext)
        for constraint in Base.metadata.tables["vehicles"].constraints
        if isinstance(constraint, CheckConstraint)
    }

    assert constraints == {
        "vehicle_type_check": "vehicle_type IN ('private', 'commercial')",
        "fuel_type_check": ("fuel_type IN ('petrol', 'diesel', 'ev', 'cng', 'hybrid')"),
        "transmission_check": (
            "transmission IN ('manual', 'semi_automatic', 'automatic')"
        ),
        "odometer_reading_check": "odometer > 0",
        "vehicle_manufacture_year_check": "manufacture_year >= 1970",
        "engine_cc_check": "engine_capacity >= 998",
    }
