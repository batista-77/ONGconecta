import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


class Configuracao:
    SECRET_KEY = os.getenv("SECRET_KEY", "chave-desenvolvimento")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "chave-jwt-desenvolvimento")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///ongconecta.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    CORS_ORIGENS = [
        origem.strip()
        for origem in os.getenv("CORS_ORIGENS", "http://localhost:5173").split(",")
        if origem.strip()
    ]
