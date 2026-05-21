from datetime import date

from app.extensoes import db
from app.modelos import Beneficiario, Entrega, Kit
from app.servicos.auditoria_servico import registrar_log
from app.utils.excecoes import ErroRegraNegocio


def registrar_entrega(dados, usuario_id):
    kit = Kit.query.get_or_404(dados["kit_id"])
    Beneficiario.query.get_or_404(dados["beneficiario_id"])
    if kit.status != "aprovado":
        raise ErroRegraNegocio("Apenas kits aprovados podem ser entregues.")
    if kit.entrega:
        raise ErroRegraNegocio("Este kit já possui entrega registrada.")

    data_entrega = date.fromisoformat(dados.get("data_entrega", date.today().isoformat()))
    entrega = Entrega(
        kit_id=kit.id,
        beneficiario_id=dados["beneficiario_id"],
        responsavel_id=usuario_id,
        data_entrega=data_entrega,
        observacao=dados.get("observacao"),
    )
    kit.status = "entregue"
    db.session.add(entrega)
    db.session.flush()
    registrar_log(usuario_id, "registrar_entrega", "Entrega", entrega.id, "Entrega registrada.")
    db.session.commit()
    return entrega

