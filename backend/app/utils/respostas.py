def responder_sucesso(mensagem, dados=None, status=200):
    corpo = {"sucesso": True, "mensagem": mensagem}
    if dados is not None:
        corpo["dados"] = dados
    return corpo, status


def responder_erro(mensagem, status=400, detalhes=None):
    corpo = {"sucesso": False, "mensagem": mensagem}
    if detalhes is not None:
        corpo["detalhes"] = detalhes
    return corpo, status

