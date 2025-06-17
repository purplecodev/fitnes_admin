import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", 'postgresql://purplecode:root@localhost/fitnes_admin')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
