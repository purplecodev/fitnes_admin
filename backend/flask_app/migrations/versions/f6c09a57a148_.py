"""empty message

Revision ID: f6c09a57a148
Revises: 
Create Date: 2025-05-27 15:52:23.432600

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f6c09a57a148'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('clients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(length=100), nullable=False),
        sa.Column('phone_number', sa.String(length=20), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('sports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=100), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('subscription',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('sport_id', sa.Integer(), nullable=False),
        sa.Column('expiration_date', sa.Date(), nullable=False),
        sa.Column('type_subscription', sa.String(length=20), nullable=False),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),  # можно добавить, если нужно
        sa.ForeignKeyConstraint(['sport_id'], ['sports.id'], ondelete='CASCADE'),    # каскадное удаление!
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('trainers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(length=100), nullable=False),
        sa.Column('phone_number', sa.String(length=20), nullable=False),
        sa.Column('sport_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['sport_id'], ['sports.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('client_trainer',
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('trainer_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id']),
        sa.ForeignKeyConstraint(['trainer_id'], ['trainers.id']),
        sa.PrimaryKeyConstraint('client_id', 'trainer_id')
    )


def downgrade():
    op.drop_table('client_trainer')
    op.drop_table('trainers')
    op.drop_table('subscription')
    op.drop_table('sports')
    op.drop_table('clients')
