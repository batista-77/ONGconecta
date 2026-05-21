from sqlalchemy.exc import IntegrityError

from app.extensoes import db
from app.utils.excecoes import ErroRegraNegocio
from app.utils.respostas import responder_erro


def registrar_tratadores(aplicacao):
    @aplicacao.errorhandler(ErroRegraNegocio)
    def tratar_regra_negocio(erro):
        return responder_erro(erro.mensagem, erro.status)

    @aplicacao.errorhandler(IntegrityError)
    def tratar_integridade(erro):
        db.session.rollback()
        return responder_erro("Não foi possível salvar. Verifique dados duplicados ou inválidos.", 400)

    @aplicacao.errorhandler(404)
    def tratar_nao_encontrado(erro):
        return responder_erro("Recurso não encontrado.", 404)

    @aplicacao.errorhandler(Exception)
    def tratar_erro_inesperado(erro):
        db.session.rollback()
        return responder_erro("Ocorreu um erro inesperado no servidor.", 500)

