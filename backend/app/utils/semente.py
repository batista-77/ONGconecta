from app.extensoes import db
from app.modelos import Categoria, Usuario


def criar_dados_iniciais():
    usuario = Usuario.query.filter_by(email="admin@ongconecta.com").first()
    if not usuario:
        usuario = Usuario(nome="Administrador", email="admin@ongconecta.com", perfil="gestor", ativo=True)
        usuario.definir_senha("admin123")
        db.session.add(usuario)

    categorias = [
        ("Alimentos", "Itens alimentícios doados para montagem de kits."),
        ("Higiene", "Produtos de higiene pessoal e limpeza."),
        ("Vestuário", "Roupas, calçados e acessórios."),
    ]
    for nome, descricao in categorias:
        if not Categoria.query.filter_by(nome=nome).first():
            db.session.add(Categoria(nome=nome, descricao=descricao))
    db.session.commit()

