from app.extensoes import db
from app.modelos.base import ModeloBase


class SolicitacaoDoacao(ModeloBase):
    __tablename__ = "solicitacoes_doacao"

    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120))
    telefone = db.Column(db.String(30))
    tipo_doacao = db.Column(db.String(80), nullable=False)
    descricao_itens = db.Column(db.String(500), nullable=False)
    quantidade_aproximada = db.Column(db.String(80))
    validade = db.Column(db.Date)
    endereco_retirada = db.Column(db.String(255))
    observacao = db.Column(db.String(500))
    status = db.Column(db.String(20), nullable=False, default="pendente")

    def para_json(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "telefone": self.telefone,
            "tipo_doacao": self.tipo_doacao,
            "descricao_itens": self.descricao_itens,
            "quantidade_aproximada": self.quantidade_aproximada,
            "validade": self.validade.isoformat() if self.validade else None,
            "endereco_retirada": self.endereco_retirada,
            "observacao": self.observacao,
            "status": self.status,
            "criado_em": self.criado_em.isoformat(),
            "atualizado_em": self.atualizado_em.isoformat(),
        }


class SolicitacaoVoluntario(ModeloBase):
    __tablename__ = "solicitacoes_voluntario"

    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    telefone = db.Column(db.String(30))
    disponibilidade = db.Column(db.String(120))
    area_interesse = db.Column(db.String(120))
    mensagem = db.Column(db.String(500))
    status = db.Column(db.String(20), nullable=False, default="pendente")

    def para_json(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "telefone": self.telefone,
            "disponibilidade": self.disponibilidade,
            "area_interesse": self.area_interesse,
            "mensagem": self.mensagem,
            "status": self.status,
            "criado_em": self.criado_em.isoformat(),
            "atualizado_em": self.atualizado_em.isoformat(),
        }
