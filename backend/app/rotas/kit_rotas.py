from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Namespace, Resource

from app.extensoes import api
from app.middleware.permissoes import exigir_perfil
from app.modelos import Kit
from app.schemas.documentacao import registrar_modelos
from app.servicos.kit_servico import adicionar_item_kit, aprovar_kit, criar_kit
from app.utils.respostas import responder_sucesso

ns = Namespace("Kits", description="Criação, montagem e aprovação de kits")
modelos = registrar_modelos(api)


@ns.route("")
class KitsRecurso(Resource):
    @jwt_required()
    def get(self):
        kits = Kit.query.order_by(Kit.criado_em.desc()).all()
        return responder_sucesso("Kits listados com sucesso.", [kit.para_json() for kit in kits])

    @jwt_required()
    @ns.expect(modelos["kit"], validate=True)
    def post(self):
        kit = criar_kit(request.get_json() or {}, int(get_jwt_identity()))
        return responder_sucesso("Kit criado com sucesso.", kit.para_json(), 201)


@ns.route("/<int:kit_id>")
class KitRecurso(Resource):
    @jwt_required()
    def get(self, kit_id):
        kit = Kit.query.get_or_404(kit_id)
        return responder_sucesso("Kit encontrado com sucesso.", kit.para_json())


@ns.route("/<int:kit_id>/itens")
class ItensKitRecurso(Resource):
    @jwt_required()
    @ns.expect(modelos["item_kit"], validate=True)
    def post(self, kit_id):
        kit = adicionar_item_kit(kit_id, request.get_json() or {}, int(get_jwt_identity()))
        return responder_sucesso("Item adicionado ao kit com sucesso.", kit.para_json(), 201)


@ns.route("/<int:kit_id>/aprovar")
class AprovarKitRecurso(Resource):
    @jwt_required()
    @exigir_perfil("gestor")
    def post(self, kit_id):
        kit = aprovar_kit(kit_id, int(get_jwt_identity()))
        return responder_sucesso("Kit aprovado com sucesso.", kit.para_json())

