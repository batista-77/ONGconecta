from app import criar_app

aplicacao = criar_app()

if __name__ == "__main__":
    aplicacao.run(host="0.0.0.0", port=5000, debug=True)

