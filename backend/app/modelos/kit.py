from app.extensoes import db
from app.modelos.base import ModeloBase


class Kit(ModeloBase):
    __tablename__ = "kits"

    nome = db.Column(db.String(120), nullable=False)
    descricao = db.Column(db.String(255))
    status = db.Column(db.String(20), nullable=False, default="pendente")
    aprovado_por_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"))
    aprovado_por = db.relationship("Usuario")
    itens = db.relationship("ItemKit", back_populates="kit", cascade="all, delete-orphan")
    entrega = db.relationship("Entrega", back_populates="kit", uselist=False)

    def para_json(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "status": self.status,
            "aprovado_por_id": self.aprovado_por_id,
            "itens": [item_kit.para_json() for item_kit in self.itens],
            "criado_em": self.criado_em.isoformat(),
            "atualizado_em": self.atualizado_em.isoformat(),
        }


class ItemKit(ModeloBase):
    __tablename__ = "itens_kit"

    kit_id = db.Column(db.Integer, db.ForeignKey("kits.id"), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey("itens.id"), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    kit = db.relationship("Kit", back_populates="itens")
    item = db.relationship("Item", back_populates="itens_kit")

    def para_json(self):
        return {
            "id": self.id,
            "kit_id": self.kit_id,
            "item_id": self.item_id,
            "item": self.item.nome if self.item else None,
            "quantidade": self.quantidade,
        }

