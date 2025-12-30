# Projeto: Blog (Full Stack)

Blog completo com:

- Autenticação (cadastro, login, logout)
- CRUD de postagens (cada usuário edita/exclui apenas as próprias postagens)
- CRUD de usuários (apenas ADMIN)

## Stack

**Backend**
- ASP.NET Core Web API (.NET 6)
- ASP.NET Core Identity + JWT (Bearer)
- PostgreSQL + Entity Framework Core (Npgsql)

**Frontend**
- React + TypeScript (Vite)

**Infra**
- Docker / Docker Compose

---

## Executar localmente (com Docker)

### Pré-requisitos
- Docker (Docker Desktop / Engine) instalado

### Subir tudo

Na raiz do projeto:

```bash
docker compose up --build
```

### Acessos
- Frontend: http://localhost:3000
- Backend (Swagger): http://localhost:8080/swagger
- PostgreSQL: localhost:5432 (user: `blog`, pass: `blog`, db: `blogdb`)

### Usuário ADMIN padrão (seed)
- Email: `admin@local`
- Senha: `Admin123!`

> Obs.: o seed do admin é controlado por variáveis no `docker-compose.yml` (chaves `Seed__AdminEmail` e `Seed__AdminPassword`).

---

## Regras implementadas

### Autenticação
- Todas as rotas de API (postagens e usuários) exigem **JWT**.
- O endpoint `POST /api/auth/logout` existe por completude, mas em JWT o logout é **stateless**: o frontend remove o token do `localStorage`.

### Postagens
- `GET /api/posts` retorna as postagens em ordem decrescente de data.
- `POST /api/posts` cria uma postagem do usuário autenticado.
- `PUT /api/posts/{id}` e `DELETE /api/posts/{id}` só funcionam se a postagem pertencer ao usuário autenticado.

### Usuários
- `GET/POST/PUT/DELETE /api/users` somente para usuários com role `ADMIN`.
- Modelo de role simples (1 role por usuário: `USER` ou `ADMIN`).

---

## Variáveis importantes (Docker)

Você pode alterar no `docker-compose.yml`:

- `ConnectionStrings__DefaultConnection`
- `Jwt__SigningKey` (obrigatório mudar em produção)
- `Seed__AdminEmail` e `Seed__AdminPassword`

---

## Desenvolvimento sem Docker (opcional)

Se quiser rodar fora do Docker:

### Backend
- Instale .NET 6 SDK
- Configure o PostgreSQL e ajuste `ConnectionStrings:DefaultConnection` no `appsettings.json`
- Rode:

```bash
cd backend/Blog.Api
dotnet restore
dotnet run
```

### Frontend
- Instale Node 18+ (recomendado 20)
- Crie `.env` em `frontend/`:

```bash
VITE_API_URL=http://localhost:8080/api
```

- Rode:

```bash
cd frontend
npm install
npm run dev
```

---

## Git Flow (modelo de ramificação)

Sugestão de fluxo:

- `main`: versões estáveis (produção)
- `develop`: integração das features
- `feature/<nome>`: novas funcionalidades
- `release/<versao>`: preparação de release
- `hotfix/<nome>`: correções urgentes em produção

Exemplo:

```bash
git checkout -b develop
git checkout -b feature/crud-posts develop
# ... commits
git checkout develop
git merge --no-ff feature/crud-posts
```

---

## Estrutura do repositório

```
.
├─ backend/
│  └─ Blog.Api/
├─ frontend/
├─ docker-compose.yml
└─ README.md
```

---

## Licença
Projeto de estudo/demonstração.
