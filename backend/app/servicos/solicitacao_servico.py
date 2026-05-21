from datetime import date

from app.extensoes import db
from app.modelos import SolicitacaoDoacao, SolicitacaoVoluntario
from app.servicos.auditoria_servico import registrar_log
from app.utils.excecoes import ErroRegraNegocio

STATUS_VALIDOS = {"pendente", "aprovada", "recusada", "recebida"}


def criar_solicitacao_doacao(dados):
    validade = dados.get("validade")
    solicitacao = SolicitacaoDoacao(
        nome=dados["nome"].strip(),
        email=(dados.get("email") or "").strip() or None,
        telefone=(dados.get("telefone") or "").strip() or None,
        tipo_doacao=dados["tipo_doacao"].strip(),
        descricao_itens=dados["descricao_itens"].strip(),
        quantidade_aproximada=(dados.get("quantidade_aproximada") or "").strip() or None,
        validade=date.fromisoformat(validade) if validade else None,
        endereco_retirada=(dados.get("endereco_retirada") or "").strip() or None,
        observacao=(dados.get("observacao") or "").strip() or None,
        status="pendente",
    )
    db.session.add(solicitacao)
    db.session.commit()
    return solicitacao


def criar_solicitacao_voluntario(dados):
    solicitacao = SolicitacaoVoluntario(
        nome=dados["nome"].strip(),
        email=dados["email"].strip().lower(),
        telefone=(dados.get("telefone") or "").strip() or None,
        disponibilidade=(dados.get("disponibilidade") or "").strip() or None,
        area_interesse=(dados.get("area_interesse") or "").strip() or None,
        mensagem=(dados.get("mensagem") or "").strip() or None,
        status="pendente",
    )
    db.session.add(solicitacao)
    db.session.commit()
    return solicitacao


def atualizar_status_solicitacao(modelo, solicitacao_id, status, usuario_id):
    if status not in STATUS_VALIDOS:
        raise ErroRegraNegocio("Status invalido para solicitacao.")

    solicitacao = modelo.query.get_or_404(solicitacao_id)
    solicitacao.status = status
    registrar_log(usuario_id, "atualizar_status", modelo.__name__, solicitacao.id, f"Status alterado para {status}.")
    db.session.commit()
    return solicitacao
