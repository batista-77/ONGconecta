from app.extensoes import db
from app.modelos.base import ModeloBase


class Entrega(ModeloBase):
    __tablename__ = "entregas"

    kit_id = db.Column(db.Integer, db.ForeignKey("kits.id"), nullable=False, unique=True)
    beneficiario_id = db.Column(db.Integer, db.ForeignKey("beneficiarios.id"), nullable=False)
    responsavel_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    data_entrega = db.Column(db.Date, nullable=False)
    observacao = db.Column(db.String(255))
    kit = db.relationship("Kit", back_populates="entrega")
    beneficiario = db.relationship("Beneficiario", back_populates="entregas")
    responsavel = db.relationship("Usuario")

    def para_json(self):
        return {
            "id": self.id,
            "kit_id": self.kit_id,
            "beneficiario_id": self.beneficiario_id,
            "beneficiario": self.beneficiario.nome if self.beneficiario else None,
            "responsavel_id": self.responsavel_id,
            "responsavel": self.responsavel.nome if self.responsavel else None,
            "data_entrega": self.data_entrega.isoformat(),
            "observacao": self.observacao,
            "criado_em": self.criado_em.isoformat(),
            "atualizado_em": self.atualizado_em.isoformat(),
        }

