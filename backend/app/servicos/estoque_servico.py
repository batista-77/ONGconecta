from datetime import date, timedelta

from app.extensoes import db
from app.modelos import EntradaEstoque, Item, MovimentacaoEstoque
from app.servicos.auditoria_servico import registrar_log
from app.utils.excecoes import ErroRegraNegocio


def calcular_quantidade_item(item_id):
    entradas = EntradaEstoque.query.filter_by(item_id=item_id).all()
    return sum(entrada.quantidade_disponivel for entrada in entradas)


def registrar_entrada_estoque(dados, usuario_id=None):
    item = Item.query.get_or_404(dados["item_id"])
    validade = date.fromisoformat(dados["validade"])
    quantidade = int(dados["quantidade"])
    if validade < date.today():
        raise ErroRegraNegocio("Não é permitido cadastrar item vencido no estoque.")
    if quantidade <= 0:
        raise ErroRegraNegocio("A quantidade de entrada deve ser maior que zero.")

    entrada = EntradaEstoque(
        item_id=item.id,
        doador_id=dados.get("doador_id"),
        lote=dados["lote"],
        validade=validade,
        quantidade=quantidade,
        quantidade_disponivel=quantidade,
    )
    db.session.add(entrada)
    db.session.flush()
    movimentacao = MovimentacaoEstoque(
        item_id=item.id,
        entrada_estoque_id=entrada.id,
        tipo="entrada",
        quantidade=quantidade,
        observacao="Entrada de estoque registrada.",
        usuario_id=usuario_id,
    )
    db.session.add(movimentacao)
    registrar_log(usuario_id, "entrada_estoque", "EntradaEstoque", entrada.id, "Entrada de item registrada.")
    db.session.commit()
    return entrada


def baixar_estoque_item(item_id, quantidade, usuario_id=None, observacao="Baixa de estoque."):
    if quantidade <= 0:
        raise ErroRegraNegocio("A quantidade para baixa deve ser maior que zero.")
    quantidade_disponivel = calcular_quantidade_item(item_id)
    if quantidade_disponivel < quantidade:
        raise ErroRegraNegocio("Estoque insuficiente para realizar a operação.")

    restante = quantidade
    entradas = (
        EntradaEstoque.query.filter(
            EntradaEstoque.item_id == item_id,
            EntradaEstoque.quantidade_disponivel > 0,
            EntradaEstoque.validade >= date.today(),
        )
        .order_by(EntradaEstoque.validade.asc(), EntradaEstoque.criado_em.asc())
        .all()
    )
    for entrada in entradas:
        if restante == 0:
            break
        quantidade_baixada = min(entrada.quantidade_disponivel, restante)
        entrada.quantidade_disponivel -= quantidade_baixada
        restante -= quantidade_baixada
        db.session.add(
            MovimentacaoEstoque(
                item_id=item_id,
                entrada_estoque_id=entrada.id,
                tipo="saida",
                quantidade=quantidade_baixada,
                observacao=observacao,
                usuario_id=usuario_id,
            )
        )
    if restante > 0:
        raise ErroRegraNegocio("Não há estoque válido suficiente para esta operação.")


def listar_itens_estoque_baixo():
    itens = Item.query.all()
    return [
        item.para_json()
        for item in itens
        if calcular_quantidade_item(item.id) <= item.estoque_minimo
    ]


def listar_itens_vencendo(dias=30):
    limite = date.today() + timedelta(days=dias)
    entradas = EntradaEstoque.query.filter(
        EntradaEstoque.quantidade_disponivel > 0,
        EntradaEstoque.validade >= date.today(),
        EntradaEstoque.validade <= limite,
    ).all()
    return [entrada.para_json() for entrada in entradas]

