from app.extensoes import db
from app.modelos.base import ModeloBase


class Beneficiario(ModeloBase):
    __tablename__ = "beneficiarios"

    nome = db.Column(db.String(120), nullable=False)
    documento = db.Column(db.String(30), unique=True)
    telefone = db.Column(db.String(30))
    endereco = db.Column(db.String(255))
    prioridade = db.Column(db.String(20), nullable=False, default="media")
    quantidade_pessoas_familia = db.Column(db.Integer, nullable=False, default=1)
    entregas = db.relationship("Entrega", back_populates="beneficiario")

    def para_json(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "documento": self.documento,
            "telefone": self.telefone,
            "endereco": self.endereco,
            "prioridade": self.prioridade,
            "quantidade_pessoas_familia": self.quantidade_pessoas_familia,
            "criado_em": self.criado_em.isoformat(),
            "atualizado_em": self.atualizado_em.isoformat(),
        }

