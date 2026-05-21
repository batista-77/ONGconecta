from app.extensoes import db
from app.modelos.base import ModeloBase


class Item(ModeloBase):
    __tablename__ = "itens"

    nome = db.Column(db.String(120), nullable=False)
    descricao = db.Column(db.String(255))
    unidade_medida = db.Column(db.String(30), nullable=False)
    estoque_minimo = db.Column(db.Integer, nullable=False, default=0)
    categoria_id = db.Column(db.Integer, db.ForeignKey("categorias.id"), nullable=False)
    categoria = db.relationship("Categoria", back_populates="itens")
    entradas = db.relationship("EntradaEstoque", back_populates="item")
    itens_kit = db.relationship("ItemKit", back_populates="item")

    def para_json(self):
        quantidade_atual = sum(entrada.quantidade_disponivel for entrada in self.entradas)
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "unidade_medida": self.unidade_medida,
            "estoque_minimo": self.estoque_minimo,
            "categoria_id": self.categoria_id,
            "categoria": self.categoria.nome if self.categoria else None,
            "quantidade_atual": quantidade_atual,
            "criado_em": self.criado_em.isoformat(),
            "atualizado_em": self.atualizado_em.isoformat(),
        }

