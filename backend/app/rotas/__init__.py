from app.rotas.autenticacao_rotas import ns as autenticacao_ns
from app.rotas.beneficiario_rotas import ns as beneficiario_ns
from app.rotas.categoria_rotas import ns as categoria_ns
from app.rotas.dashboard_rotas import ns as dashboard_ns
from app.rotas.doador_rotas import ns as doador_ns
from app.rotas.entrega_rotas import ns as entrega_ns
from app.rotas.estoque_rotas import ns as estoque_ns
from app.rotas.item_rotas import ns as item_ns
from app.rotas.kit_rotas import ns as kit_ns
from app.rotas.solicitacao_rotas import ns as solicitacao_ns
from app.rotas.usuario_rotas import ns as usuario_ns


def registrar_rotas(api):
    api.add_namespace(autenticacao_ns, path="/autenticacao")
    api.add_namespace(usuario_ns, path="/usuarios")
    api.add_namespace(doador_ns, path="/doadores")
    api.add_namespace(beneficiario_ns, path="/beneficiarios")
    api.add_namespace(categoria_ns, path="/categorias")
    api.add_namespace(item_ns, path="/itens")
    api.add_namespace(estoque_ns, path="/estoque")
    api.add_namespace(kit_ns, path="/kits")
    api.add_namespace(entrega_ns, path="/entregas")
    api.add_namespace(dashboard_ns, path="/dashboard")
    api.add_namespace(solicitacao_ns, path="/solicitacoes")
