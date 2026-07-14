"""create migration checks table

Revision ID: b38e34ebb988
Revises: 
Create Date: 2026-07-14 13:22:21.146564
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = 'b38e34ebb988'
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'migration_checks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('marker', sa.String(length=64), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('marker'),
    )


def downgrade() -> None:
    op.drop_table('migration_checks')
