# ONGConecta Backend

API REST em Python para o MVP acadêmico ONGConecta, um sistema de gerenciamento de doações, estoque, kits e entregas para uma ONG.

## Tecnologias

- Python
- Flask
- Flask-RESTX
- SQLAlchemy
- Flask-JWT-Extended
- Flask-Migrate
- SQLite em desenvolvimento
- PostgreSQL preparado para produção
- Swagger automático
- Flask-CORS
- python-dotenv

## Estrutura

```text
backend/
├── app/
│   ├── configuracoes/
│   ├── extensoes/
│   ├── middleware/
│   ├── modelos/
│   ├── rotas/
│   ├── schemas/
│   ├── servicos/
│   ├── utils/
│   └── __init__.py
├── migrations/
├── testes/
├── .env.example
├── requirements.txt
├── run.py
├── seed.py
└── README.md
```

## Instalação

Entre na pasta do backend:

```bash
cd backend
```

Crie e ative o ambiente virtual:

```bash
python -m venv venv
venv\Scripts\activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Crie o arquivo `.env` a partir do exemplo:

```bash
copy .env.example .env
```

## Variáveis de ambiente

```env
FLASK_ENV=development
SECRET_KEY=troque-esta-chave
JWT_SECRET_KEY=troque-esta-chave-jwt
DATABASE_URL=sqlite:///ongconecta.db
CORS_ORIGENS=http://localhost:5173,http://127.0.0.1:5173
```

Para produção com PostgreSQL, use uma URL neste formato:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/ongconecta
```

## Migrations

Inicialize as migrations apenas uma vez:

```bash
flask --app run.py db init
```

Crie a primeira migration:

```bash
flask --app run.py db migrate -m "estrutura inicial"
```

Aplique as migrations:

```bash
flask --app run.py db upgrade
```

## Seed inicial

Popule o banco com o usuário gestor inicial e categorias básicas:

```bash
python seed.py
```

Usuário inicial:

```text
email: admin@ongconecta.com
senha: admin123
```

## Execução

```bash
python run.py
```

A API ficará disponível em:

```text
http://localhost:5000/api
```

A documentação Swagger ficará disponível em:

```text
http://localhost:5000/api/documentacao
```

## Autenticação

Faça login em:

```http
POST /api/autenticacao/login
```

Exemplo:

```json
{
  "email": "admin@ongconecta.com",
  "senha": "admin123"
}
```

Use o token retornado nas rotas protegidas:

```http
Authorization: Bearer SEU_TOKEN
```

## Perfis

- `gestor`: pode aprovar kits, visualizar dashboard completo e gerenciar usuários.
- `voluntario`: pode operar cadastros, estoque, kits pendentes e entregas.

## Endpoints principais

- `POST /api/autenticacao/login`
- `GET /api/usuarios`
- `POST /api/usuarios`
- `PUT /api/usuarios/{usuario_id}`
- `GET /api/doadores`
- `POST /api/doadores`
- `GET /api/beneficiarios`
- `POST /api/beneficiarios`
- `GET /api/categorias`
- `POST /api/categorias`
- `GET /api/itens`
- `POST /api/itens`
- `GET /api/estoque/entradas`
- `POST /api/estoque/entradas`
- `GET /api/estoque/movimentacoes`
- `GET /api/kits`
- `POST /api/kits`
- `POST /api/kits/{kit_id}/itens`
- `POST /api/kits/{kit_id}/aprovar`
- `GET /api/entregas`
- `POST /api/entregas`
- `GET /api/dashboard/resumo`
- `GET /api/dashboard/estoque-baixo`
- `GET /api/dashboard/itens-vencendo`

## Regras de negócio implementadas

- Senhas armazenadas com hash.
- Rotas protegidas por JWT.
- Permissões por perfil.
- Bloqueio de email duplicado para usuários.
- Bloqueio de estoque negativo.
- Bloqueio de cadastro de item vencido no estoque.
- Aprovação de kit somente por gestor.
- Validação de estoque antes de aprovar kits.
- Baixa automática do estoque ao aprovar kits.
- Registro de histórico de movimentações.
- Auditoria simples de ações importantes.
- Respostas JSON padronizadas.
