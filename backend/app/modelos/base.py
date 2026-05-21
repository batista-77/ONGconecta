from datetime import datetime

from app.extensoes import db


class ModeloBase(db.Model):
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

