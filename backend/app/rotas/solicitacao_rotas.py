from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Namespace, Resource, fields

from app.extensoes import api
from app.modelos import SolicitacaoDoacao, SolicitacaoVoluntario
from app.servicos.solicitacao_servico import (
    atualizar_status_solicitacao,
    criar_solicitacao_doacao,
    criar_solicitacao_voluntario,
)
from app.utils.respostas import responder_sucesso

ns = Namespace("Solicitacoes", description="Solicitacoes publicas de doacao e voluntariado")

solicitacao_doacao_modelo = api.model("SolicitacaoDoacao", {
    "nome": fields.String(required=True, example="Maria Souza"),
    "email": fields.String(example="maria@email.com"),
    "telefone": fields.String(example="92999999999"),
    "tipo_doacao": fields.String(required=True, example="Alimentos"),
    "descricao_itens": fields.String(required=True, example="Arroz, feijao e macarrao"),
    "quantidade_aproximada": fields.String(example="20 unidades"),
    "validade": fields.String(example="2026-12-31"),
    "endereco_retirada": fields.String(example="Rua Esperanca, 100"),
    "observacao": fields.String(example="Disponivel para retirada pela manha"),
})

solicitacao_voluntario_modelo = api.model("SolicitacaoVoluntario", {
    "nome": fields.String(required=True, example="Joao Lima"),
    "email": fields.String(required=True, example="joao@email.com"),
    "telefone": fields.String(example="92988888888"),
    "disponibilidade": fields.String(example="Sabados pela manha"),
    "area_interesse": fields.String(example="Triagem de doacoes"),
    "mensagem": fields.String(example="Quero ajudar nas entregas"),
})

status_modelo = api.model("StatusSolicitacao", {
    "status": fields.String(required=True, enum=["pendente", "aprovada", "recusada", "recebida"]),
})


@ns.route("/doacoes")
class SolicitacoesDoacaoRecurso(Resource):
    @ns.expect(solicitacao_doacao_modelo, validate=True)
    @ns.doc(security=None)
    def post(self):
        solicitacao = criar_solicitacao_doacao(request.get_json() or {})
        return responder_sucesso("Solicitacao de doacao enviada com sucesso.", solicitacao.para_json(), 201)

    @jwt_required()
    def get(self):
        solicitacoes = SolicitacaoDoacao.query.order_by(SolicitacaoDoacao.criado_em.desc()).all()
        return responder_sucesso("Solicitacoes de doacao listadas com sucesso.", [item.para_json() for item in solicitacoes])


@ns.route("/doacoes/<int:solicitacao_id>/status")
class StatusSolicitacaoDoacaoRecurso(Resource):
    @jwt_required()
    @ns.expect(status_modelo, validate=True)
    def put(self, solicitacao_id):
        solicitacao = atualizar_status_solicitacao(
            SolicitacaoDoacao,
            solicitacao_id,
            (request.get_json() or {})["status"],
            int(get_jwt_identity()),
        )
        return responder_sucesso("Status da solicitacao de doacao atualizado.", solicitacao.para_json())


@ns.route("/voluntarios")
class SolicitacoesVoluntarioRecurso(Resource):
    @ns.expect(solicitacao_voluntario_modelo, validate=True)
    @ns.doc(security=None)
    def post(self):
        solicitacao = criar_solicitacao_voluntario(request.get_json() or {})
        return responder_sucesso("Solicitacao de voluntariado enviada com sucesso.", solicitacao.para_json(), 201)

    @jwt_required()
    def get(self):
        solicitacoes = SolicitacaoVoluntario.query.order_by(SolicitacaoVoluntario.criado_em.desc()).all()
        return responder_sucesso("Solicitacoes de voluntariado listadas com sucesso.", [item.para_json() for item in solicitacoes])


@ns.route("/voluntarios/<int:solicitacao_id>/status")
class StatusSolicitacaoVoluntarioRecurso(Resource):
    @jwt_required()
    @ns.expect(status_modelo, validate=True)
    def put(self, solicitacao_id):
        solicitacao = atualizar_status_solicitacao(
            SolicitacaoVoluntario,
            solicitacao_id,
            (request.get_json() or {})["status"],
            int(get_jwt_identity()),
        )
        return responder_sucesso("Status da solicitacao de voluntariado atualizado.", solicitacao.para_json())
