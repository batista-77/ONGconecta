from flask import Blueprint, Flask
from flask_jwt_extended import get_jwt_identity

from app.configuracoes.configuracao import Configuracao
from app.extensoes import api, cors, db, jwt, migrate
from app.middleware.tratamento_erros import registrar_tratadores
from app.rotas import registrar_rotas
from app.utils.respostas import responder_erro


def criar_app():
    aplicacao = Flask(__name__)
    aplicacao.config.from_object(Configuracao)

    db.init_app(aplicacao)
    migrate.init_app(aplicacao, db)
    jwt.init_app(aplicacao)
    cors.init_app(aplicacao, resources={r"/api/*": {"origins": aplicacao.config["CORS_ORIGENS"]}})

    blueprint_api = Blueprint("api", __name__, url_prefix="/api")
    api.init_app(blueprint_api)
    registrar_rotas(api)
    aplicacao.register_blueprint(blueprint_api)
    registrar_tratadores(aplicacao)

    @jwt.unauthorized_loader
    def tratar_token_ausente(mensagem):
        return responder_erro("Token de autenticação não informado.", 401)

    @jwt.invalid_token_loader
    def tratar_token_invalido(mensagem):
        return responder_erro("Token de autenticação inválido.", 422)

    @jwt.expired_token_loader
    def tratar_token_expirado(cabecalho, conteudo):
        return responder_erro("Token de autenticação expirado.", 401)

    @jwt.revoked_token_loader
    def tratar_token_revogado(cabecalho, conteudo):
        return responder_erro("Token de autenticação revogado.", 401)

    @jwt.user_lookup_error_loader
    def tratar_usuario_nao_encontrado(cabecalho, conteudo):
        usuario_id = get_jwt_identity()
        return responder_erro(f"Usuário autenticado não encontrado: {usuario_id}.", 401)

    return aplicacao

