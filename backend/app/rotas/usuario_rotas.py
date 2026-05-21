from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Namespace, Resource

from app.extensoes import api
from app.middleware.permissoes import exigir_perfil
from app.modelos import Usuario
from app.schemas.documentacao import registrar_modelos
from app.servicos.usuario_servico import atualizar_usuario, criar_usuario
from app.utils.respostas import responder_sucesso

ns = Namespace("Usuários", description="Gerenciamento de usuários")
modelos = registrar_modelos(api)


@ns.route("")
class UsuariosRecurso(Resource):
    @jwt_required()
    @exigir_perfil("gestor")
    def get(self):
        usuarios = Usuario.query.order_by(Usuario.nome.asc()).all()
        return responder_sucesso("Usuários listados com sucesso.", [usuario.para_json() for usuario in usuarios])

    @jwt_required()
    @exigir_perfil("gestor")
    @ns.expect(modelos["usuario"], validate=True)
    def post(self):
        usuario = criar_usuario(request.get_json() or {}, int(get_jwt_identity()))
        return responder_sucesso("Usuário criado com sucesso.", usuario.para_json(), 201)


@ns.route("/<int:usuario_id>")
class UsuarioRecurso(Resource):
    @jwt_required()
    @exigir_perfil("gestor")
    def get(self, usuario_id):
        usuario = Usuario.query.get_or_404(usuario_id)
        return responder_sucesso("Usuário encontrado com sucesso.", usuario.para_json())

    @jwt_required()
    @exigir_perfil("gestor")
    @ns.expect(modelos["usuario"], validate=False)
    def put(self, usuario_id):
        usuario = atualizar_usuario(usuario_id, request.get_json() or {}, int(get_jwt_identity()))
        return responder_sucesso("Usuário atualizado com sucesso.", usuario.para_json())

