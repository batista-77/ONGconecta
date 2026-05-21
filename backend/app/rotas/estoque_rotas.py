from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Namespace, Resource

from app.extensoes import api
from app.modelos import EntradaEstoque, MovimentacaoEstoque
from app.schemas.documentacao import registrar_modelos
from app.servicos.estoque_servico import registrar_entrada_estoque
from app.utils.respostas import responder_sucesso

ns = Namespace("Estoque", description="Entradas e histórico de movimentações")
modelos = registrar_modelos(api)


@ns.route("/entradas")
class EntradasEstoqueRecurso(Resource):
    @jwt_required()
    def get(self):
        entradas = EntradaEstoque.query.order_by(EntradaEstoque.validade.asc()).all()
        return responder_sucesso("Entradas de estoque listadas com sucesso.", [entrada.para_json() for entrada in entradas])

    @jwt_required()
    @ns.expect(modelos["entrada_estoque"], validate=True)
    def post(self):
        entrada = registrar_entrada_estoque(request.get_json() or {}, int(get_jwt_identity()))
        return responder_sucesso("Entrada de estoque registrada com sucesso.", entrada.para_json(), 201)


@ns.route("/movimentacoes")
class MovimentacoesEstoqueRecurso(Resource):
    @jwt_required()
    def get(self):
        movimentacoes = MovimentacaoEstoque.query.order_by(MovimentacaoEstoque.criado_em.desc()).all()
        return responder_sucesso(
            "Movimentações de estoque listadas com sucesso.",
            [movimentacao.para_json() for movimentacao in movimentacoes],
        )

