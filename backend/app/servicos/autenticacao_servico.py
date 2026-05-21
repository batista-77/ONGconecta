from flask_jwt_extended import create_access_token

from app.extensoes import db
from app.modelos import Usuario
from app.servicos.auditoria_servico import registrar_log
from app.utils.excecoes import ErroRegraNegocio


def autenticar_usuario(email, senha):
    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario or not usuario.verificar_senha(senha):
        raise ErroRegraNegocio("Email ou senha inválidos.", 401)
    if not usuario.ativo:
        raise ErroRegraNegocio("Usuário inativo.", 403)

    token = create_access_token(
        identity=str(usuario.id),
        additional_claims={"perfil": usuario.perfil, "email": usuario.email},
    )
    registrar_log(usuario.id, "login", "Usuario", usuario.id, "Login realizado com sucesso.")
    db.session.commit()
    return {"token": token, "usuario": usuario.para_json()}

