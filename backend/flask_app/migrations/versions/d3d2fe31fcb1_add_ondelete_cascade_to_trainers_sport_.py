"""Add ondelete cascade to trainers.sport_id FK

Revision ID: d3d2fe31fcb1
Revises: f6c09a57a148
Create Date: 2025-05-28 15:30:36.467624

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'd3d2fe31fcb1'
down_revision = 'f6c09a57a148'
branch_labels = None
depends_on = None


def upgrade():
    # Удаляем старое ограничение FK
    op.drop_constraint('trainers_sport_id_fkey', 'trainers', type_='foreignkey')
    # Создаем новое с ondelete='CASCADE'
    op.create_foreign_key(
        'trainers_sport_id_fkey',
        'trainers', 'sports',
        ['sport_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade():
    # Откат: удаляем FK с ondelete, возвращаем старый FK без ondelete
    op.drop_constraint('trainers_sport_id_fkey', 'trainers', type_='foreignkey')
    op.create_foreign_key(
        'trainers_sport_id_fkey',
        'trainers', 'sports',
        ['sport_id'], ['id']
    )
