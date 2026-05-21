from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_restx import Api
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()

api = Api(
    title="ONGConecta API",
    version="1.0",
    description="API REST para gerenciamento de doacoes, estoque, kits e entregas.",
    doc="/documentacao",
    authorizations={
        "Bearer": {
            "type": "apiKey",
            "in": "header",
            "name": "Authorization",
            "description": "Informe: Bearer <token>",
        }
    },
    security="Bearer",
)

