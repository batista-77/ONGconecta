from app.extensoes import db
from app.modelos.base import ModeloBase


class Doador(ModeloBase):
    __tablename__ = "doadores"

    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True)
    telefone = db.Column(db.String(30))
    documento = db.Column(db.String(30))
    endereco = db.Column(db.String(255))
    entradas = db.relationship("EntradaEstoque", back_populates="doador")

    def para_json(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "telefone": self.telefone,
            "documento": self.documento,
            "endereco": self.endereco,
            "criado_em": self.criado_em.isoformat(),
            "atualizado_em": self.atualizado_em.isoformat(),
        }

