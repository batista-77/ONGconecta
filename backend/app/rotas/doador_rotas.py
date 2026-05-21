from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Namespace, Resource

from app.extensoes import api, db
from app.modelos import Doador
from app.schemas.documentacao import registrar_modelos
from app.servicos.auditoria_servico import registrar_log
from app.utils.respostas import responder_sucesso

ns = Namespace("Doadores", description="CRUD de doadores")
modelos = registrar_modelos(api)


@ns.route("")
class DoadoresRecurso(Resource):
    @jwt_required()
    def get(self):
        doadores = Doador.query.order_by(Doador.nome.asc()).all()
        return responder_sucesso("Doadores listados com sucesso.", [doador.para_json() for doador in doadores])

    @jwt_required()
    @ns.expect(modelos["doador"], validate=True)
    def post(self):
        dados = request.get_json() or {}
        doador = Doador(**dados)
        db.session.add(doador)
        db.session.flush()
        registrar_log(int(get_jwt_identity()), "criar", "Doador", doador.id, "Doador criado.")
        db.session.commit()
        return responder_sucesso("Doador criado com sucesso.", doador.para_json(), 201)


@ns.route("/<int:doador_id>")
class DoadorRecurso(Resource):
    @jwt_required()
    def get(self, doador_id):
        doador = Doador.query.get_or_404(doador_id)
        return responder_sucesso("Doador encontrado com sucesso.", doador.para_json())

    @jwt_required()
    @ns.expect(modelos["doador"], validate=False)
    def put(self, doador_id):
        doador = Doador.query.get_or_404(doador_id)
        for campo in ["nome", "email", "telefone", "documento", "endereco"]:
            if campo in (request.get_json() or {}):
                setattr(doador, campo, request.get_json()[campo])
        registrar_log(int(get_jwt_identity()), "editar", "Doador", doador.id, "Doador atualizado.")
        db.session.commit()
        return responder_sucesso("Doador atualizado com sucesso.", doador.para_json())

    @jwt_required()
    def delete(self, doador_id):
        doador = Doador.query.get_or_404(doador_id)
        db.session.delete(doador)
        registrar_log(int(get_jwt_identity()), "excluir", "Doador", doador_id, "Doador removido.")
        db.session.commit()
        return responder_sucesso("Doador removido com sucesso.")

