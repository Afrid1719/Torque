from sqlalchemy import UniqueConstraint, inspect

import app.db.models  # noqa: F401
from app.db.base import Base
from app.db.models import User


def unique_column_sets(table_name: str) -> set[tuple[str, ...]]:
    table = Base.metadata.tables[table_name]
    return {
        tuple(column.name for column in constraint.columns)
        for constraint in table.constraints
        if isinstance(constraint, UniqueConstraint)
    }


def test_authentication_tables_are_registered() -> None:
    assert {
        "users",
        "roles",
        "permissions",
        "role_permissions",
        "user_sessions",
    }.issubset(Base.metadata.tables)


def test_user_schema_enforces_single_role_and_hash_storage() -> None:
    users = Base.metadata.tables["users"]

    assert "password_hash" in users.c
    assert "password" not in users.c
    assert users.c.password_hash.nullable is False
    assert users.c.is_active.nullable is False
    assert users.c.role_id.nullable is False
    assert ("username",) in unique_column_sets("users")
    assert next(iter(users.c.role_id.foreign_keys)).target_fullname == "roles.id"
    assert inspect(User).relationships.role.uselist is False


def test_role_permission_schema_has_required_constraints() -> None:
    role_permissions = Base.metadata.tables["role_permissions"]

    assert ("name",) in unique_column_sets("roles")
    assert ("code",) in unique_column_sets("permissions")
    assert tuple(role_permissions.primary_key.columns.keys()) == (
        "role_id",
        "permission_id",
    )
    assert (
        next(iter(role_permissions.c.role_id.foreign_keys)).target_fullname
        == "roles.id"
    )
    assert (
        next(iter(role_permissions.c.permission_id.foreign_keys)).target_fullname
        == "permissions.id"
    )


def test_user_session_schema_supports_secure_persistence() -> None:
    sessions = Base.metadata.tables["user_sessions"]

    assert "refresh_token_hash" in sessions.c
    assert "refresh_token" not in sessions.c
    assert ("refresh_token_hash",) in unique_column_sets("user_sessions")
    assert next(iter(sessions.c.user_id.foreign_keys)).target_fullname == "users.id"
    assert sessions.c.expires_at.nullable is False
    assert sessions.c.revoked_at.nullable is True
    assert sessions.c.last_used_at.nullable is True
    assert sessions.c.user_agent.nullable is True
    assert sessions.c.ip_address.nullable is True
    assert {index.name for index in sessions.indexes} == {
        "ix_user_sessions_expires_at",
        "ix_user_sessions_user_id",
    }


def test_authentication_models_include_timestamps() -> None:
    for table_name in ("users", "roles", "permissions", "user_sessions"):
        table = Base.metadata.tables[table_name]
        assert table.c.created_at.nullable is False
        assert table.c.updated_at.nullable is False
