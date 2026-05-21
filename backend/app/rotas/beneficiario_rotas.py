from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Namespace, Resource

from app.extensoes import api, db
from app.modelos import Beneficiario
from app.schemas.documentacao import registrar_modelos
from app.servicos.auditoria_servico import registrar_log
from app.utils.respostas import responder_sucesso

ns = Namespace("Beneficiários", description="CRUD de beneficiários")
modelos = registrar_modelos(api)


@ns.route("")
class BeneficiariosRecurso(Resource):
    @jwt_required()
    def get(self):
        beneficiarios = Beneficiario.query.order_by(Beneficiario.prioridade.desc(), Beneficiario.nome.asc()).all()
        return responder_sucesso("Beneficiários listados com sucesso.", [beneficiario.para_json() for beneficiario in beneficiarios])

    @jwt_required()
    @ns.expect(modelos["beneficiario"], validate=True)
    def post(self):
        beneficiario = Beneficiario(**(request.get_json() or {}))
        db.session.add(beneficiario)
        db.session.flush()
        registrar_log(int(get_jwt_identity()), "criar", "Beneficiario", beneficiario.id, "Beneficiário criado.")
        db.session.commit()
        return responder_sucesso("Beneficiário criado com sucesso.", beneficiario.para_json(), 201)


@ns.route("/<int:beneficiario_id>")
class BeneficiarioRecurso(Resource):
    @jwt_required()
    def get(self, beneficiario_id):
        beneficiario = Beneficiario.query.get_or_404(beneficiario_id)
        return responder_sucesso("Beneficiário encontrado com sucesso.", beneficiario.para_json())

    @jwt_required()
    @ns.expect(modelos["beneficiario"], validate=False)
    def put(self, beneficiario_id):
        beneficiario = Beneficiario.query.get_or_404(beneficiario_id)
        dados = request.get_json() or {}
        for campo in ["nome", "documento", "telefone", "endereco", "prioridade", "quantidade_pessoas_familia"]:
            if campo in dados:
                setattr(beneficiario, campo, dados[campo])
        registrar_log(int(get_jwt_identity()), "editar", "Beneficiario", beneficiario.id, "Beneficiário atualizado.")
        db.session.commit()
        return responder_sucesso("Beneficiário atualizado com sucesso.", beneficiario.para_json())

    @jwt_required()
    def delete(self, beneficiario_id):
        beneficiario = Beneficiario.query.get_or_404(beneficiario_id)
        db.session.delete(beneficiario)
        registrar_log(int(get_jwt_identity()), "excluir", "Beneficiario", beneficiario_id, "Beneficiário removido.")
        db.session.commit()
        return responder_sucesso("Beneficiário removido com sucesso.")

