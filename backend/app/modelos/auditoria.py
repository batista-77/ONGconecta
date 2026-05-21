from app.extensoes import db
from app.modelos.base import ModeloBase


class LogAuditoria(ModeloBase):
    __tablename__ = "logs_auditoria"

    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"))
    acao = db.Column(db.String(120), nullable=False)
    entidade = db.Column(db.String(80), nullable=False)
    entidade_id = db.Column(db.Integer)
    detalhes = db.Column(db.String(255))
    usuario = db.relationship("Usuario")

    def para_json(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "acao": self.acao,
            "entidade": self.entidade,
            "entidade_id": self.entidade_id,
            "detalhes": self.detalhes,
            "criado_em": self.criado_em.isoformat(),
        }

