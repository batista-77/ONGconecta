from app.extensoes import db
from app.modelos.base import ModeloBase


class Categoria(ModeloBase):
    __tablename__ = "categorias"

    nome = db.Column(db.String(80), nullable=False, unique=True)
    descricao = db.Column(db.String(255))
    itens = db.relationship("Item", back_populates="categoria")

    def para_json(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "criado_em": self.criado_em.isoformat(),
            "atualizado_em": self.atualizado_em.isoformat(),
        }

