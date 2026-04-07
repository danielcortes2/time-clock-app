"""Initial migration

Revision ID: 6bae37eb93d9
Revises: 
Create Date: 2026-04-06 20:10:19.578084

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6bae37eb93d9'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('email', sa.String(255), unique=True, index=True, nullable=True),
        sa.Column('hashed_password', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=True),
        sa.Column('is_superuser', sa.Boolean(), default=False, nullable=True),
        sa.Column('full_name', sa.String(255), nullable=True),
    )
    op.create_table(
        'time_entries',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('clock_in', sa.DateTime(), nullable=True),
        sa.Column('clock_out', sa.DateTime(), nullable=True),
    )
    op.create_table(
        'schedules',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.String(10), nullable=False),
        sa.Column('end_time', sa.String(10), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=True),
    )


def downgrade() -> None:
    op.drop_table('schedules')
    op.drop_table('time_entries')
    op.drop_table('users')
