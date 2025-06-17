"""Add cascade delete to client_trainer.trainer_id FK

Revision ID: your_new_revision_id
Revises: d3d2fe31fcb1
Create Date: 2025-05-28 15:50:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'your_new_revision_id'
down_revision = 'd3d2fe31fcb1'
branch_labels = None
depends_on = None

def upgrade():
    # Удаляем старый внешний ключ
    op.drop_constraint('client_trainer_trainer_id_fkey', 'client_trainer', type_='foreignkey')
    # Создаем новый с ondelete='CASCADE'
    op.create_foreign_key(
        'client_trainer_trainer_id_fkey',
        'client_trainer', 'trainers',
        ['trainer_id'], ['id'],
        ondelete='CASCADE'
    )

def downgrade():
    # Откат — вернуть внешний ключ без каскада
    op.drop_constraint('client_trainer_trainer_id_fkey', 'client_trainer', type_='foreignkey')
    op.create_foreign_key(
        'client_trainer_trainer_id_fkey',
        'client_trainer', 'trainers',
        ['trainer_id'], ['id']
    )
