from werkzeug.security import check_password_hash, generate_password_hash

from app.extensoes import db
from app.modelos.base import ModeloBase


class Usuario(ModeloBase):
    __tablename__ = "usuarios"

    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True, index=True)
    senha_hash = db.Column(db.String(255), nullable=False)
    perfil = db.Column(db.String(20), nullable=False, default="voluntario")
    ativo = db.Column(db.Boolean, nullable=False, default=True)

    def definir_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)

    def verificar_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)

    def para_json(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "perfil": self.perfil,
            "ativo": self.ativo,
            "criado_em": self.criado_em.isoformat(),
            "atualizado_em": self.atualizado_em.isoformat(),
        }

