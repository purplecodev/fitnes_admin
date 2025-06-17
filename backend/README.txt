Flask Backend with PostgreSQL

Описание:
Проект использует Flask, SQLAlchemy и PostgreSQL для создания базы данных с таблицами клиентов, тренеров, видов спорта и подписок.

Таблицы:
- clients: id, full_name, phone_number
- trainers: id, full_name, phone_number, sport_id
- sports: id, title, price
- subscription: id, client_id, sport_id, expiration_date, type_subscription
- client_trainer: связь многие ко многим между clients и trainers

Как запустить:
1. Установите зависимости: pip install -r requirements.txt
2. Установите переменную окружения DATABASE_URL с адресом вашей базы PostgreSQL.
3. Инициализируйте миграции:
   flask db init
   flask db migrate
   flask db upgrade
4. Запустите приложение: python flask_app/app.py
