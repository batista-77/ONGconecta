from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Namespace, Resource

from app.extensoes import api, db
from app.modelos import Categoria, Item
from app.schemas.documentacao import registrar_modelos
from app.servicos.auditoria_servico import registrar_log
from app.utils.respostas import responder_sucesso

ns = Namespace("Itens", description="CRUD de itens")
modelos = registrar_modelos(api)


@ns.route("")
class ItensRecurso(Resource):
    @jwt_required()
    def get(self):
        itens = Item.query.order_by(Item.nome.asc()).all()
        return responder_sucesso("Itens listados com sucesso.", [item.para_json() for item in itens])

    @jwt_required()
    @ns.expect(modelos["item"], validate=True)
    def post(self):
        dados = request.get_json() or {}
        Categoria.query.get_or_404(dados["categoria_id"])
        item = Item(**dados)
        db.session.add(item)
        db.session.flush()
        registrar_log(int(get_jwt_identity()), "criar", "Item", item.id, "Item criado.")
        db.session.commit()
        return responder_sucesso("Item criado com sucesso.", item.para_json(), 201)


@ns.route("/<int:item_id>")
class ItemRecurso(Resource):
    @jwt_required()
    def get(self, item_id):
        item = Item.query.get_or_404(item_id)
        return responder_sucesso("Item encontrado com sucesso.", item.para_json())

    @jwt_required()
    @ns.expect(modelos["item"], validate=False)
    def put(self, item_id):
        item = Item.query.get_or_404(item_id)
        dados = request.get_json() or {}
        if "categoria_id" in dados:
            Categoria.query.get_or_404(dados["categoria_id"])
        for campo in ["nome", "descricao", "unidade_medida", "estoque_minimo", "categoria_id"]:
            if campo in dados:
                setattr(item, campo, dados[campo])
        registrar_log(int(get_jwt_identity()), "editar", "Item", item.id, "Item atualizado.")
        db.session.commit()
        return responder_sucesso("Item atualizado com sucesso.", item.para_json())

    @jwt_required()
    def delete(self, item_id):
        item = Item.query.get_or_404(item_id)
        db.session.delete(item)
        registrar_log(int(get_jwt_identity()), "excluir", "Item", item_id, "Item removido.")
        db.session.commit()
        return responder_sucesso("Item removido com sucesso.")

