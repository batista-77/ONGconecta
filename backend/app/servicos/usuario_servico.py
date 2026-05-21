from app.extensoes import db
from app.modelos import Usuario
from app.servicos.auditoria_servico import registrar_log
from app.utils.excecoes import ErroRegraNegocio

PERFIS_VALIDOS = {"gestor", "voluntario"}


def criar_usuario(dados, usuario_logado_id=None):
    email = dados.get("email", "").strip().lower()
    if Usuario.query.filter_by(email=email).first():
        raise ErroRegraNegocio("Já existe um usuário com este email.")
    perfil = dados.get("perfil", "voluntario")
    if perfil not in PERFIS_VALIDOS:
        raise ErroRegraNegocio("Perfil inválido. Use gestor ou voluntario.")

    usuario = Usuario(nome=dados["nome"], email=email, perfil=perfil, ativo=dados.get("ativo", True))
    usuario.definir_senha(dados["senha"])
    db.session.add(usuario)
    db.session.flush()
    registrar_log(usuario_logado_id, "criar", "Usuario", usuario.id, "Usuário criado.")
    db.session.commit()
    return usuario


def atualizar_usuario(usuario_id, dados, usuario_logado_id=None):
    usuario = Usuario.query.get_or_404(usuario_id)
    if "email" in dados:
        email = dados["email"].strip().lower()
        existente = Usuario.query.filter(Usuario.email == email, Usuario.id != usuario_id).first()
        if existente:
            raise ErroRegraNegocio("Já existe um usuário com este email.")
        usuario.email = email
    if "nome" in dados:
        usuario.nome = dados["nome"]
    if "perfil" in dados:
        if dados["perfil"] not in PERFIS_VALIDOS:
            raise ErroRegraNegocio("Perfil inválido. Use gestor ou voluntario.")
        usuario.perfil = dados["perfil"]
    if "ativo" in dados:
        usuario.ativo = dados["ativo"]
    if dados.get("senha"):
        usuario.definir_senha(dados["senha"])
    registrar_log(usuario_logado_id, "editar", "Usuario", usuario.id, "Usuário atualizado.")
    db.session.commit()
    return usuario

