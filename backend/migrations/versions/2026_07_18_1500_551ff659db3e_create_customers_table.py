"""create customers table

Revision ID: 551ff659db3e
Revises: 38b1c5cb2127
Create Date: 2026-07-18 15:00:00.000000
"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "551ff659db3e"
down_revision: str | Sequence[str] | None = "38b1c5cb2127"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "customers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("mobile_number", sa.String(length=16), nullable=False),
        sa.Column("email", sa.String(length=254), nullable=True),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column("notes", sa.String(length=2000), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("mobile_number", name="uq_customers_mobile_number"),
    )


def downgrade() -> None:
    op.drop_table("customers")
