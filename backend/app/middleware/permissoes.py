from functools import wraps

from flask_jwt_extended import get_jwt

from app.utils.excecoes import ErroRegraNegocio


def exigir_perfil(*perfis_permitidos):
    def decorar(funcao):
        @wraps(funcao)
        def executar(*args, **kwargs):
            perfil = get_jwt().get("perfil")
            if perfil not in perfis_permitidos:
                raise ErroRegraNegocio("Você não possui permissão para acessar este recurso.", 403)
            return funcao(*args, **kwargs)

        return executar

    return decorar

