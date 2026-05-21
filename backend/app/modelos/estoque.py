from app.extensoes import db
from app.modelos.base import ModeloBase


class EntradaEstoque(ModeloBase):
    __tablename__ = "entradas_estoque"

    item_id = db.Column(db.Integer, db.ForeignKey("itens.id"), nullable=False)
    doador_id = db.Column(db.Integer, db.ForeignKey("doadores.id"))
    lote = db.Column(db.String(80), nullable=False)
    validade = db.Column(db.Date, nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    quantidade_disponivel = db.Column(db.Integer, nullable=False)
    item = db.relationship("Item", back_populates="entradas")
    doador = db.relationship("Doador", back_populates="entradas")

    def para_json(self):
        return {
            "id": self.id,
            "item_id": self.item_id,
            "item": self.item.nome if self.item else None,
            "doador_id": self.doador_id,
            "doador": self.doador.nome if self.doador else None,
            "lote": self.lote,
            "validade": self.validade.isoformat(),
            "quantidade": self.quantidade,
            "quantidade_disponivel": self.quantidade_disponivel,
            "criado_em": self.criado_em.isoformat(),
            "atualizado_em": self.atualizado_em.isoformat(),
        }


class MovimentacaoEstoque(ModeloBase):
    __tablename__ = "movimentacoes_estoque"

    item_id = db.Column(db.Integer, db.ForeignKey("itens.id"), nullable=False)
    entrada_estoque_id = db.Column(db.Integer, db.ForeignKey("entradas_estoque.id"))
    tipo = db.Column(db.String(20), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    observacao = db.Column(db.String(255))
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"))
    item = db.relationship("Item")
    entrada_estoque = db.relationship("EntradaEstoque")
    usuario = db.relationship("Usuario")

    def para_json(self):
        return {
            "id": self.id,
            "item_id": self.item_id,
            "item": self.item.nome if self.item else None,
            "entrada_estoque_id": self.entrada_estoque_id,
            "tipo": self.tipo,
            "quantidade": self.quantidade,
            "observacao": self.observacao,
            "usuario_id": self.usuario_id,
            "criado_em": self.criado_em.isoformat(),
        }

