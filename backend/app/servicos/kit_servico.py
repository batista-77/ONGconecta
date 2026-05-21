from app.extensoes import db
from app.modelos import Item, ItemKit, Kit
from app.servicos.auditoria_servico import registrar_log
from app.servicos.estoque_servico import baixar_estoque_item, calcular_quantidade_item
from app.utils.excecoes import ErroRegraNegocio


def criar_kit(dados, usuario_id=None):
    kit = Kit(nome=dados["nome"], descricao=dados.get("descricao"), status="pendente")
    db.session.add(kit)
    db.session.flush()
    registrar_log(usuario_id, "criar", "Kit", kit.id, "Kit criado com status pendente.")
    db.session.commit()
    return kit


def adicionar_item_kit(kit_id, dados, usuario_id=None):
    kit = Kit.query.get_or_404(kit_id)
    if kit.status != "pendente":
        raise ErroRegraNegocio("Só é possível alterar kits pendentes.")
    item = Item.query.get_or_404(dados["item_id"])
    quantidade = int(dados["quantidade"])
    if quantidade <= 0:
        raise ErroRegraNegocio("A quantidade do item no kit deve ser maior que zero.")
    if calcular_quantidade_item(item.id) < quantidade:
        raise ErroRegraNegocio("Estoque insuficiente para adicionar este item ao kit.")

    item_kit = ItemKit(kit_id=kit.id, item_id=item.id, quantidade=quantidade)
    db.session.add(item_kit)
    registrar_log(usuario_id, "adicionar_item", "Kit", kit.id, "Item adicionado ao kit.")
    db.session.commit()
    return kit


def aprovar_kit(kit_id, usuario_id):
    kit = Kit.query.get_or_404(kit_id)
    if kit.status != "pendente":
        raise ErroRegraNegocio("Apenas kits pendentes podem ser aprovados.")
    if not kit.itens:
        raise ErroRegraNegocio("Não é possível aprovar kit sem itens.")
    for item_kit in kit.itens:
        if calcular_quantidade_item(item_kit.item_id) < item_kit.quantidade:
            raise ErroRegraNegocio(f"Estoque insuficiente para o item {item_kit.item.nome}.")

    for item_kit in kit.itens:
        baixar_estoque_item(
            item_kit.item_id,
            item_kit.quantidade,
            usuario_id,
            f"Baixa automática pela aprovação do kit {kit.id}.",
        )
    kit.status = "aprovado"
    kit.aprovado_por_id = usuario_id
    registrar_log(usuario_id, "aprovar", "Kit", kit.id, "Kit aprovado e estoque baixado.")
    db.session.commit()
    return kit

