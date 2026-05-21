from flask_restx import fields


def registrar_modelos(api):
    modelos = {}
    modelos["login"] = api.model("Login", {
        "email": fields.String(required=True, example="admin@ongconecta.com"),
        "senha": fields.String(required=True, example="admin123"),
    })
    modelos["usuario"] = api.model("Usuario", {
        "nome": fields.String(required=True, example="Administrador"),
        "email": fields.String(required=True, example="admin@ongconecta.com"),
        "senha": fields.String(required=True, example="admin123"),
        "perfil": fields.String(example="gestor", enum=["gestor", "voluntario"]),
        "ativo": fields.Boolean(example=True),
    })
    modelos["doador"] = api.model("Doador", {
        "nome": fields.String(required=True, example="Mercado Solidário"),
        "email": fields.String(example="contato@mercado.com"),
        "telefone": fields.String(example="11999999999"),
        "documento": fields.String(example="12345678000199"),
        "endereco": fields.String(example="Rua das Flores, 100"),
    })
    modelos["beneficiario"] = api.model("Beneficiario", {
        "nome": fields.String(required=True, example="Maria Silva"),
        "documento": fields.String(example="12345678900"),
        "telefone": fields.String(example="11988888888"),
        "endereco": fields.String(example="Rua Esperança, 50"),
        "prioridade": fields.String(example="alta", enum=["baixa", "media", "alta"]),
        "quantidade_pessoas_familia": fields.Integer(example=4),
    })
    modelos["categoria"] = api.model("Categoria", {
        "nome": fields.String(required=True, example="Alimentos"),
        "descricao": fields.String(example="Itens alimentícios não perecíveis"),
    })
    modelos["item"] = api.model("Item", {
        "nome": fields.String(required=True, example="Arroz"),
        "descricao": fields.String(example="Pacote de arroz 5kg"),
        "unidade_medida": fields.String(required=True, example="unidade"),
        "estoque_minimo": fields.Integer(example=10),
        "categoria_id": fields.Integer(required=True, example=1),
    })
    modelos["entrada_estoque"] = api.model("EntradaEstoque", {
        "item_id": fields.Integer(required=True, example=1),
        "doador_id": fields.Integer(example=1),
        "lote": fields.String(required=True, example="LOTE-2026-01"),
        "validade": fields.String(required=True, example="2026-12-31"),
        "quantidade": fields.Integer(required=True, example=50),
    })
    modelos["kit"] = api.model("Kit", {
        "nome": fields.String(required=True, example="Kit família"),
        "descricao": fields.String(example="Kit básico de alimentos"),
    })
    modelos["item_kit"] = api.model("ItemKit", {
        "item_id": fields.Integer(required=True, example=1),
        "quantidade": fields.Integer(required=True, example=2),
    })
    modelos["entrega"] = api.model("Entrega", {
        "kit_id": fields.Integer(required=True, example=1),
        "beneficiario_id": fields.Integer(required=True, example=1),
        "data_entrega": fields.String(example="2026-05-17"),
        "observacao": fields.String(example="Entrega realizada na sede da ONG"),
    })
    return modelos

