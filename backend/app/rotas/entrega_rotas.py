from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Namespace, Resource

from app.extensoes import api
from app.modelos import Entrega
from app.schemas.documentacao import registrar_modelos
from app.servicos.entrega_servico import registrar_entrega
from app.utils.respostas import responder_sucesso

ns = Namespace("Entregas", description="Registro de entregas")
modelos = registrar_modelos(api)


@ns.route("")
class EntregasRecurso(Resource):
    @jwt_required()
    def get(self):
        entregas = Entrega.query.order_by(Entrega.data_entrega.desc()).all()
        return responder_sucesso("Entregas listadas com sucesso.", [entrega.para_json() for entrega in entregas])

    @jwt_required()
    @ns.expect(modelos["entrega"], validate=True)
    def post(self):
        entrega = registrar_entrega(request.get_json() or {}, int(get_jwt_identity()))
        return responder_sucesso("Entrega registrada com sucesso.", entrega.para_json(), 201)


@ns.route("/<int:entrega_id>")
class EntregaRecurso(Resource):
    @jwt_required()
    def get(self, entrega_id):
        entrega = Entrega.query.get_or_404(entrega_id)
        return responder_sucesso("Entrega encontrada com sucesso.", entrega.para_json())

