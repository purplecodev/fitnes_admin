from . import db

client_trainer = db.Table('client_trainer',
    db.Column('client_id', db.Integer, db.ForeignKey('clients.id'), primary_key=True),
    db.Column('trainer_id', db.Integer, db.ForeignKey('trainers.id', ondelete='CASCADE'), primary_key=True)
)


class Client(db.Model):
    __tablename__ = 'clients'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)

    trainers = db.relationship('Trainer', secondary=client_trainer, backref='clients')
    subscriptions = db.relationship('Subscription', backref='client', cascade='all, delete-orphan')

class Sport(db.Model):
    __tablename__ = 'sports'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)

    subscriptions = db.relationship('Subscription', back_populates='sport', cascade='all, delete-orphan')

class Trainer(db.Model):
    __tablename__ = 'trainers'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    sport_id = db.Column(db.Integer, db.ForeignKey('sports.id', ondelete='CASCADE'))
    sport = db.relationship('Sport', passive_deletes=True)

class Subscription(db.Model):
    __tablename__ = 'subscription'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    sport_id = db.Column(db.Integer, db.ForeignKey('sports.id'), nullable=False)
    expiration_date = db.Column(db.Date, nullable=False)
    type_subscription = db.Column(db.String(20), nullable=False)

    sport = db.relationship('Sport', back_populates='subscriptions')
