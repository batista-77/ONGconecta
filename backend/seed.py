from app import criar_app
from app.extensoes import db
from app.utils.semente import criar_dados_iniciais

aplicacao = criar_app()

with aplicacao.app_context():
    db.create_all()
    criar_dados_iniciais()
    print("Banco populado com sucesso. Usuário inicial: admin@ongconecta.com / admin123")

