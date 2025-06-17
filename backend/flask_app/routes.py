from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from . import db
from .models import Client, Trainer, Sport, Subscription
from .helpers import calculate_expiration_date

bp = Blueprint('routes', __name__)

@bp.route('/clients', methods=['POST'])
def add_client():
    data = request.get_json()
    client = Client(full_name=data['fullName'], phone_number=data['phoneNumber'])
    db.session.add(client)
    db.session.commit()
    return jsonify({'message': 'Client added'}), 201

@bp.route('/clients/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    data = request.get_json()
    client = Client.query.get_or_404(client_id)
    client.full_name = data.get('fullName', client.full_name)
    client.phone_number = data.get('phoneNumber', client.phone_number)
    db.session.commit()
    return jsonify({'message': 'Client updated'})

@bp.route('/clients/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    client = Client.query.get_or_404(client_id)
    db.session.delete(client)
    db.session.commit()
    return jsonify({'message': 'Client deleted'})

@bp.route('/trainers', methods=['POST'])
def add_trainer():
    data = request.get_json()

    full_name = data.get('fullName')
    phone_number = data.get('phoneNumber')
    sport_id = data.get('sportId')

    if not full_name or not phone_number or not sport_id:
        return jsonify({'error': 'fullName, phoneNumber, and sportId are required'}), 400

    # Получаем вид спорта
    sport = Sport.query.get(sport_id)
    if not sport:
        return jsonify({'error': f'Sport with id {sport_id} not found'}), 404

    # Создаём тренера и связываем со спортом
    trainer = Trainer(full_name=full_name, phone_number=phone_number, sport=sport)
    db.session.add(trainer)
    db.session.commit()

    return jsonify({
        'id': trainer.id,
        'fullName': trainer.full_name,
        'phoneNumber': trainer.phone_number,
        'sport': {
            'id': sport.id,
            'title': sport.title,
            'price': sport.price
        }
    }), 201


@bp.route('/trainers/<int:trainer_id>', methods=['PUT'])
def update_trainer(trainer_id):
    data = request.get_json()
    trainer = Trainer.query.get_or_404(trainer_id)

    trainer.full_name = data.get('full_name', trainer.full_name)
    trainer.phone_number = data.get('phone_number', trainer.phone_number)

    # Если передан sportId, обновляем связь с видом спорта
    sport_id = data.get('sportId')
    if sport_id is not None:
        sport = Sport.query.get_or_404(sport_id)
        trainer.sport = sport
    else:
        # Если передано явно null, удаляем связь
        trainer.sport = None

    db.session.commit()
    return jsonify({'message': 'Trainer updated'})


@bp.route('/trainers/<int:trainer_id>', methods=['DELETE'])
def delete_trainer(trainer_id):
    trainer = Trainer.query.get_or_404(trainer_id)
    db.session.delete(trainer)
    db.session.commit()
    return jsonify({'message': 'Trainer deleted'})

@bp.route('/clients/<int:client_id>/trainers', methods=['PUT'])
def assign_single_trainer_to_client(client_id):
    data = request.get_json()
    client = Client.query.get_or_404(client_id)

    if not data or 'trainerId' not in data:
        return jsonify({'error': 'Missing trainerId'}), 400

    trainer = Trainer.query.get(data['trainerId'])
    if not trainer:
        return jsonify({'error': 'Trainer not found'}), 404

    # Проверим, не добавлен ли уже этот тренер
    if trainer not in client.trainers:
        client.trainers.append(trainer)

    db.session.commit()
    return jsonify({'message': 'Trainer assigned to client'})

@bp.route('/clients/<int:client_id>/trainers/<int:trainer_id>', methods=['DELETE'])
def remove_trainer_from_client(client_id, trainer_id):
    client = Client.query.get_or_404(client_id)
    trainer = Trainer.query.get_or_404(trainer_id)

    if trainer in client.trainers:
        client.trainers.remove(trainer)
        db.session.commit()
        return jsonify({'message': 'Trainer removed from client'})
    else:
        return jsonify({'message': 'Trainer not found for client'}), 404


@bp.route('/sports', methods=['POST'])
def add_sport():
    data = request.get_json()
    sport = Sport(title=data['name'], price=data['price'])
    db.session.add(sport)
    db.session.commit()
    return jsonify({'message': 'Sport added'}), 201

@bp.route('/sports/<int:sport_id>', methods=['PUT'])
def update_sport(sport_id):
    data = request.get_json()
    sport = Sport.query.get_or_404(sport_id)
    sport.title = data.get('name', sport.title)
    sport.price = data.get('price', sport.price)
    db.session.commit()
    return jsonify({'message': 'Sport updated'})

@bp.route('/sports/<int:sport_id>', methods=['DELETE'])
def delete_sport(sport_id):
    sport = Sport.query.get_or_404(sport_id)
    db.session.delete(sport)
    db.session.commit()
    return jsonify({'message': 'Sport deleted'})

@bp.route('/clients', methods=['GET'])
def get_clients():
    clients = Client.query.all()
    result = []

    for client in clients:
        result.append({
            'id': client.id,
            'fullName': client.full_name,
            'phoneNumber': client.phone_number,
            'trainers': [
                {
                    'id': t.id,
                    'fullName': t.full_name,
                    'phoneNumber': t.phone_number,
                    'sport': {
                        'id': t.sport.id,
                        'title': t.sport.title,
                        'price': t.sport.price
                    } if t.sport else None
                } for t in client.trainers
            ],
            'subscriptions': [
                {
                    'id': s.id,
                    'expires': s.expiration_date.isoformat(),
                    'type': s.type_subscription,
                    'sport': {
                        'id': s.sport.id,
                        'name': s.sport.title,
                        'price': s.sport.price
                    }
                } for s in Subscription.query.filter_by(client_id=client.id).all()
            ]
        })

    return jsonify(result)

@bp.route('/trainers', methods=['GET'])
def get_trainers():
    trainers = Trainer.query.all()
    return jsonify([
        {
            'id': t.id,
            'fullName': t.full_name,
            'phoneNumber': t.phone_number,
            'sport': {
                'id': t.sport.id,
                'title': t.sport.title,
                'price': t.sport.price
            } if t.sport else None
        } for t in trainers
    ])

@bp.route('/sports', methods=['GET'])
def get_sports():
    sports = Sport.query.all()
    return jsonify([
        {'id': s.id, 'name': s.title, 'price': s.price} for s in sports
    ])

@bp.route('/subscriptions', methods=['GET'])
def get_subscriptions():
    subs = Subscription.query.all()
    return jsonify([
        {
            'id': s.id,
            'client': s.client.full_name,
            'sport': s.sport.title,
            'type': s.type_subscription,
            'expires': s.expiration_date.isoformat()
        } for s in subs
    ])


@bp.route('/subscriptions', methods=['POST'])
def add_subscription():
    data = request.json
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    try:
        client_id = data['clientId']
        sport_id = data['sportId']
        type_subscription = data['type']
        expiration_date = calculate_expiration_date(type_subscription)
    except KeyError:
        return jsonify({'error': 'Missing required fields'}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    new_sub = Subscription(
        client_id=client_id,
        sport_id=sport_id,
        expiration_date=expiration_date,
        type_subscription=type_subscription
    )
    db.session.add(new_sub)
    db.session.commit()
    return jsonify({'message': 'Subscription added', 'id': new_sub.id}), 201


@bp.route('/subscriptions/<int:id>', methods=['PUT'])
def update_subscription(id):
    sub = Subscription.query.get(id)
    if not sub:
        return jsonify({'error': 'Subscription not found'}), 404

    data = request.json
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    try:
        if 'clientId' in data:
            sub.client_id = data['clientId']
        if 'sportId' in data:
            sub.sport_id = data['sportId']
        if 'type' in data:
            sub.type_subscription = data['type']
            sub.expiration_date = calculate_expiration_date(data['type'])
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    db.session.commit()
    return jsonify({'message': 'Subscription updated'})

@bp.route('/subscriptions/<int:id>', methods=['DELETE'])
def delete_subscription(id):
    sub = Subscription.query.get(id)
    if not sub:
        return jsonify({'error': 'Subscription not found'}), 404

    db.session.delete(sub)
    db.session.commit()
    return jsonify({'message': 'Subscription deleted'})