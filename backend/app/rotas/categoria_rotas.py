from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Namespace, Resource

from app.extensoes import api, db
from app.modelos import Categoria
from app.schemas.documentacao import registrar_modelos
from app.servicos.auditoria_servico import registrar_log
from app.utils.respostas import responder_sucesso

ns = Namespace("Categorias", description="CRUD de categorias")
modelos = registrar_modelos(api)


@ns.route("")
class CategoriasRecurso(Resource):
    @jwt_required()
    def get(self):
        categorias = Categoria.query.order_by(Categoria.nome.asc()).all()
        return responder_sucesso("Categorias listadas com sucesso.", [categoria.para_json() for categoria in categorias])

    @jwt_required()
    @ns.expect(modelos["categoria"], validate=True)
    def post(self):
        categoria = Categoria(**(request.get_json() or {}))
        db.session.add(categoria)
        db.session.flush()
        registrar_log(int(get_jwt_identity()), "criar", "Categoria", categoria.id, "Categoria criada.")
        db.session.commit()
        return responder_sucesso("Categoria criada com sucesso.", categoria.para_json(), 201)


@ns.route("/<int:categoria_id>")
class CategoriaRecurso(Resource):
    @jwt_required()
    def get(self, categoria_id):
        categoria = Categoria.query.get_or_404(categoria_id)
        return responder_sucesso("Categoria encontrada com sucesso.", categoria.para_json())

    @jwt_required()
    @ns.expect(modelos["categoria"], validate=False)
    def put(self, categoria_id):
        categoria = Categoria.query.get_or_404(categoria_id)
        dados = request.get_json() or {}
        for campo in ["nome", "descricao"]:
            if campo in dados:
                setattr(categoria, campo, dados[campo])
        registrar_log(int(get_jwt_identity()), "editar", "Categoria", categoria.id, "Categoria atualizada.")
        db.session.commit()
        return responder_sucesso("Categoria atualizada com sucesso.", categoria.para_json())

    @jwt_required()
    def delete(self, categoria_id):
        categoria = Categoria.query.get_or_404(categoria_id)
        db.session.delete(categoria)
        registrar_log(int(get_jwt_identity()), "excluir", "Categoria", categoria_id, "Categoria removida.")
        db.session.commit()
        return responder_sucesso("Categoria removida com sucesso.")

