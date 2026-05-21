from flask_jwt_extended import jwt_required
from flask_restx import Namespace, Resource

from app.middleware.permissoes import exigir_perfil
from app.modelos import Beneficiario, Entrega, Kit
from app.servicos.estoque_servico import listar_itens_estoque_baixo, listar_itens_vencendo
from app.utils.respostas import responder_sucesso

ns = Namespace("Dashboard", description="Indicadores gerenciais")


@ns.route("/estoque-baixo")
class EstoqueBaixoRecurso(Resource):
    @jwt_required()
    @exigir_perfil("gestor")
    def get(self):
        return responder_sucesso("Itens com estoque baixo listados com sucesso.", listar_itens_estoque_baixo())


@ns.route("/itens-vencendo")
class ItensVencendoRecurso(Resource):
    @jwt_required()
    @exigir_perfil("gestor")
    def get(self):
        return responder_sucesso("Itens próximos do vencimento listados com sucesso.", listar_itens_vencendo())


@ns.route("/resumo")
class ResumoDashboardRecurso(Resource):
    @jwt_required()
    @exigir_perfil("gestor")
    def get(self):
        dados = {
            "total_entregas": Entrega.query.count(),
            "total_beneficiarios": Beneficiario.query.count(),
            "total_kits_entregues": Kit.query.filter_by(status="entregue").count(),
            "itens_estoque_baixo": listar_itens_estoque_baixo(),
            "itens_vencendo": listar_itens_vencendo(),
        }
        return responder_sucesso("Dashboard carregado com sucesso.", dados)

