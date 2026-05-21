from __future__ import annotations

import argparse
import hashlib
import os
import secrets
import sqlite3
import string
from datetime import UTC, datetime
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
INSTANCE_DIR = BASE_DIR / "instance"
DB_PATH = INSTANCE_DIR / "ongconecta.db"


def gerar_hash_werkzeug(senha: str) -> str:
    salt = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(16))
    iteracoes = 1_000_000
    hash_bytes = hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), salt.encode("utf-8"), iteracoes)
    return f"pbkdf2:sha256:{iteracoes}${salt}${hash_bytes.hex()}"


def agora() -> str:
    return datetime.now(UTC).replace(tzinfo=None).strftime("%Y-%m-%d %H:%M:%S.%f")


SCHEMA = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL,
    ativo BOOLEAN NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS ix_usuarios_email ON usuarios (email);

CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    nome VARCHAR(80) NOT NULL,
    descricao VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE (nome)
);

CREATE TABLE IF NOT EXISTS doadores (
    id INTEGER NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120),
    telefone VARCHAR(30),
    documento VARCHAR(30),
    endereco VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS beneficiarios (
    id INTEGER NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    nome VARCHAR(120) NOT NULL,
    documento VARCHAR(30),
    telefone VARCHAR(30),
    endereco VARCHAR(255),
    prioridade VARCHAR(20) NOT NULL,
    quantidade_pessoas_familia INTEGER NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (documento)
);

CREATE TABLE IF NOT EXISTS itens (
    id INTEGER NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    nome VARCHAR(120) NOT NULL,
    descricao VARCHAR(255),
    unidade_medida VARCHAR(30) NOT NULL,
    estoque_minimo INTEGER NOT NULL,
    categoria_id INTEGER NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(categoria_id) REFERENCES categorias (id)
);

CREATE TABLE IF NOT EXISTS entradas_estoque (
    id INTEGER NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    item_id INTEGER NOT NULL,
    doador_id INTEGER,
    lote VARCHAR(80) NOT NULL,
    validade DATE NOT NULL,
    quantidade INTEGER NOT NULL,
    quantidade_disponivel INTEGER NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(item_id) REFERENCES itens (id),
    FOREIGN KEY(doador_id) REFERENCES doadores (id)
);

CREATE TABLE IF NOT EXISTS kits (
    id INTEGER NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    nome VARCHAR(120) NOT NULL,
    descricao VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    aprovado_por_id INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY(aprovado_por_id) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS itens_kit (
    id INTEGER NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    kit_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(kit_id) REFERENCES kits (id),
    FOREIGN KEY(item_id) REFERENCES itens (id)
);

CREATE TABLE IF NOT EXISTS entregas (
    id INTEGER NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    kit_id INTEGER NOT NULL,
    beneficiario_id INTEGER NOT NULL,
    responsavel_id INTEGER NOT NULL,
    data_entrega DATE NOT NULL,
    observacao VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE (kit_id),
    FOREIGN KEY(kit_id) REFERENCES kits (id),
    FOREIGN KEY(beneficiario_id) REFERENCES beneficiarios (id),
    FOREIGN KEY(responsavel_id) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id INTEGER NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    item_id INTEGER NOT NULL,
    entrada_estoque_id INTEGER,
    tipo VARCHAR(20) NOT NULL,
    quantidade INTEGER NOT NULL,
    observacao VARCHAR(255),
    usuario_id INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY(item_id) REFERENCES itens (id),
    FOREIGN KEY(entrada_estoque_id) REFERENCES entradas_estoque (id),
    FOREIGN KEY(usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS logs_auditoria (
    id INTEGER NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    usuario_id INTEGER,
    acao VARCHAR(120) NOT NULL,
    entidade VARCHAR(80) NOT NULL,
    entidade_id INTEGER,
    detalhes VARCHAR(255),
    PRIMARY KEY (id),
    FOREIGN KEY(usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS solicitacoes_doacao (
    id INTEGER NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120),
    telefone VARCHAR(30),
    tipo_doacao VARCHAR(80) NOT NULL,
    descricao_itens VARCHAR(500) NOT NULL,
    quantidade_aproximada VARCHAR(80),
    validade DATE,
    endereco_retirada VARCHAR(255),
    observacao VARCHAR(500),
    status VARCHAR(20) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS solicitacoes_voluntario (
    id INTEGER NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    telefone VARCHAR(30),
    disponibilidade VARCHAR(120),
    area_interesse VARCHAR(120),
    mensagem VARCHAR(500),
    status VARCHAR(20) NOT NULL,
    PRIMARY KEY (id)
);
"""


def popular_dados_iniciais(conexao: sqlite3.Connection) -> None:
    timestamp = agora()
    usuario = conexao.execute(
        "SELECT id FROM usuarios WHERE email = ?",
        ("admin@ongconecta.com",),
    ).fetchone()

    if usuario is None:
        conexao.execute(
            """
            INSERT INTO usuarios
                (criado_em, atualizado_em, nome, email, senha_hash, perfil, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                timestamp,
                timestamp,
                "Administrador",
                "admin@ongconecta.com",
                gerar_hash_werkzeug("admin123"),
                "gestor",
                1,
            ),
        )

    categorias = [
        ("Alimentos", "Itens aliment\u00edcios doados para montagem de kits."),
        ("Higiene", "Produtos de higiene pessoal e limpeza."),
        ("Vestu\u00e1rio", "Roupas, cal\u00e7ados e acess\u00f3rios."),
    ]
    for nome, descricao in categorias:
        existe = conexao.execute("SELECT id FROM categorias WHERE nome = ?", (nome,)).fetchone()
        if existe is None:
            conexao.execute(
                "INSERT INTO categorias (criado_em, atualizado_em, nome, descricao) VALUES (?, ?, ?, ?)",
                (timestamp, timestamp, nome, descricao),
            )


def criar_banco(resetar: bool) -> None:
    INSTANCE_DIR.mkdir(exist_ok=True)
    if resetar and DB_PATH.exists():
        DB_PATH.unlink()

    with sqlite3.connect(DB_PATH) as conexao:
        conexao.executescript(SCHEMA)
        popular_dados_iniciais(conexao)
        conexao.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description="Cria o banco SQLite local do ONGConecta.")
    parser.add_argument("--resetar", action="store_true", help="Apaga e recria o banco local.")
    args = parser.parse_args()

    criar_banco(args.resetar)
    print(f"Banco criado em: {DB_PATH}")
    print("Usuario inicial: admin@ongconecta.com / admin123")


if __name__ == "__main__":
    main()
