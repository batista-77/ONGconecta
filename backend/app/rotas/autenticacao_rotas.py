from flask import request
from flask_restx import Namespace, Resource

from app.extensoes import api
from app.schemas.documentacao import registrar_modelos
from app.servicos.autenticacao_servico import autenticar_usuario
from app.servicos.usuario_servico import criar_usuario
from app.utils.respostas import responder_sucesso

ns = Namespace("Autenticação", description="Login e emissão de token JWT")
modelos = registrar_modelos(api)


@ns.route("/login")
class LoginRecurso(Resource):
    @ns.expect(modelos["login"], validate=True)
    @ns.doc(security=None)
    def post(self):
        dados = request.get_json() or {}
        resultado = autenticar_usuario(dados["email"], dados["senha"])
        return responder_sucesso("Login realizado com sucesso.", resultado)


@ns.route("/cadastro")
class CadastroRecurso(Resource):
    @ns.expect(modelos["usuario"], validate=True)
    @ns.doc(security=None)
    def post(self):
        dados = request.get_json() or {}
        usuario = criar_usuario({
            "nome": dados["nome"],
            "email": dados["email"],
            "senha": dados["senha"],
            "perfil": "voluntario",
            "ativo": True,
        })
        return responder_sucesso("Cadastro realizado com sucesso.", usuario.para_json(), 201)
