from app.extensoes import db
from app.modelos import LogAuditoria


def registrar_log(usuario_id, acao, entidade, entidade_id=None, detalhes=None):
    log = LogAuditoria(
        usuario_id=usuario_id,
        acao=acao,
        entidade=entidade,
        entidade_id=entidade_id,
        detalhes=detalhes,
    )
    db.session.add(log)
    return log

