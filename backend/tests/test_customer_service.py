import asyncio
from unittest.mock import AsyncMock, Mock

import pytest
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.db.models import Customer
from app.schemas.customers import CustomerCreate, CustomerUpdate
from app.services.customers import (
    DuplicateMobileNumberError,
    create_customer,
    update_customer,
)


def build_session() -> AsyncMock:
    session = AsyncMock()
    session.add = Mock()
    return session


def test_create_customer_commits_and_refreshes_customer() -> None:
    session = build_session()
    payload = CustomerCreate(name="Asha Rao", mobile_number="9876543210")

    customer = asyncio.run(create_customer(session, payload))

    assert customer.name == "Asha Rao"
    assert customer.mobile_number == "9876543210"
    session.add.assert_called_once_with(customer)
    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once_with(customer)


def test_create_customer_translates_unique_constraint_failure() -> None:
    session = build_session()
    session.commit.side_effect = IntegrityError("statement", {}, Exception())

    with pytest.raises(DuplicateMobileNumberError):
        asyncio.run(
            create_customer(
                session,
                CustomerCreate(name="Asha Rao", mobile_number="9876543210"),
            )
        )

    session.rollback.assert_awaited_once()
    session.refresh.assert_not_awaited()


def test_create_customer_preserves_other_database_failures() -> None:
    session = build_session()
    session.commit.side_effect = SQLAlchemyError("database unavailable")

    with pytest.raises(SQLAlchemyError):
        asyncio.run(
            create_customer(
                session,
                CustomerCreate(name="Asha Rao", mobile_number="9876543210"),
            )
        )

    session.rollback.assert_awaited_once()


def test_update_customer_commits_and_refreshes_customer() -> None:
    session = build_session()
    customer = Customer(id=23, name="Asha Rao", mobile_number="9876543210")
    payload = CustomerUpdate(
        name="Asha Sharma",
        mobile_number="9876543211",
        email="asha@example.com",
    )

    result = asyncio.run(update_customer(session, customer, payload))

    assert result is customer
    assert customer.name == "Asha Sharma"
    assert customer.mobile_number == "9876543211"
    assert customer.email == "asha@example.com"
    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once_with(customer)


def test_update_customer_translates_duplicate_mobile_number() -> None:
    session = build_session()
    session.commit.side_effect = IntegrityError("statement", {}, Exception())
    customer = Customer(id=23, name="Asha Rao", mobile_number="9876543210")

    with pytest.raises(DuplicateMobileNumberError):
        asyncio.run(
            update_customer(
                session,
                customer,
                CustomerUpdate(name="Asha", mobile_number="9999999999"),
            )
        )

    session.rollback.assert_awaited_once()
    session.refresh.assert_not_awaited()
