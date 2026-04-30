# fuelmatch-api 🔥

Backend do FuelMatch — API REST construída com NestJS, responsável pela lógica de negócio, engine de periodização de macros, gestão de planos alimentares e integração com serviços externos.

[![CI](https://github.com/fuelmatch-app/fuelmatch-api/actions/workflows/ci.yml/badge.svg)](https://github.com/fuelmatch-app/fuelmatch-api/actions/workflows/ci.yml)
[![Deploy](https://github.com/fuelmatch-app/fuelmatch-api/actions/workflows/deploy.yml/badge.svg)](https://github.com/fuelmatch-app/fuelmatch-api/actions/workflows/deploy.yml)

---

## Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 20 LTS | Runtime |
| NestJS | 10 | Framework |
| TypeScript | 5 | Linguagem |
| PostgreSQL | 16 | Banco de dados |
| Prisma | 5 | ORM |
| Redis | 7 | Cache + refresh tokens |
| AWS S3 | — | Upload de arquivos |
| Firebase FCM | — | Push notifications |
| Pagar.me | v5 | Pagamentos |

---

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- Git

---

## Setup local

### 1. Clonar o repositório

```bash
git clone https://github.com/fuelmatch-app/fuelmatch-api.git
cd fuelmatch-api
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Subir serviços com Docker

```bash
# Sobe PostgreSQL (5432) + Redis (6379)
docker-compose up -d

# Verificar se estão rodando
docker-compose ps
```

`docker-compose.yml` local:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: fuelmatch
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Editar `.env` com os valores corretos (ver seção abaixo).

### 5. Rodar migrations e seed

```bash
# Criar tabelas
npx prisma migrate dev

# Popular banco com tabela TACO (~600 alimentos) e dados de teste
npm run db:seed
```

### 6. Iniciar em modo desenvolvimento

```bash
npm run start:dev
```

API disponível em: `http://localhost:3000`
Swagger (docs): `http://localhost:3000/docs`

---

## Variáveis de ambiente

```env
# ── Aplicação ─────────────────────────────────────────
PORT=3000
NODE_ENV=development

# ── Banco de dados ────────────────────────────────────
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fuelmatch

# ── JWT ───────────────────────────────────────────────
JWT_SECRET=mude-para-um-secret-forte-com-32-chars-minimo
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ── Redis ─────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── AWS S3 ────────────────────────────────────────────
AWS_REGION=sa-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=fuelmatch-dev-assets
CLOUDFRONT_URL=

# ── Firebase (Push Notifications) ────────────────────
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# ── Resend (Email) ────────────────────────────────────
RESEND_API_KEY=
RESEND_FROM_EMAIL=no-reply@fuelmatch.app

# ── Pagar.me ──────────────────────────────────────────
PAGARME_API_KEY=
PAGARME_WEBHOOK_SECRET=

# ── Strava (Fase 2) ───────────────────────────────────
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
```

---

## Scripts disponíveis

```bash
# Desenvolvimento
npm run start:dev      # Hot reload
npm run start:debug    # Debug mode

# Build e produção
npm run build          # Compila para /dist
npm run start:prod     # Roda o build compilado

# Banco de dados
npm run db:seed        # Popula com dados iniciais
npm run db:reset       # Reseta e re-popula (cuidado!)

# Qualidade de código
npm run lint           # ESLint
npm run lint:fix       # ESLint com auto-fix
npm run format         # Prettier

# Testes
npm run test           # Unitários
npm run test:watch     # Unitários em watch mode
npm run test:cov       # Unitários com cobertura
npm run test:e2e       # End-to-end
```

---

## Estrutura do projeto

```
fuelmatch-api/
├── src/
│   ├── modules/
│   │   ├── auth/                 # JWT, refresh tokens, guards
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── strategies/       # jwt.strategy, local.strategy
│   │   │   └── guards/           # jwt-auth.guard, roles.guard
│   │   │
│   │   ├── users/                # Entidade base de usuário
│   │   │
│   │   ├── nutritionist/         # Perfil, atletas vinculados
│   │   │   ├── nutritionist.controller.ts
│   │   │   ├── nutritionist.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── athlete/              # Perfil, anamnese
│   │   │   ├── athlete.controller.ts
│   │   │   ├── athlete.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── meal-plan/            # Planos alimentares
│   │   │   ├── meal-plan.controller.ts
│   │   │   ├── meal-plan.service.ts
│   │   │   ├── macros.calculator.ts   # Cálculo TDEE + macros
│   │   │   └── dto/
│   │   │
│   │   ├── food/                 # Banco TACO + busca de alimentos
│   │   │
│   │   ├── periodization/        # ← Engine central do FuelMatch
│   │   │   ├── periodization.controller.ts
│   │   │   ├── periodization.service.ts
│   │   │   ├── periodization.engine.ts   # Lógica de multiplicadores
│   │   │   └── dto/
│   │   │
│   │   ├── check-in/             # Check-in semanal + alertas
│   │   │   ├── checkin.controller.ts
│   │   │   ├── checkin.service.ts
│   │   │   ├── alerts.service.ts         # Regras de alerta
│   │   │   └── dto/
│   │   │
│   │   ├── notifications/        # Firebase FCM + Resend
│   │   │
│   │   └── payments/             # Pagar.me, assinaturas, webhooks
│   │
│   ├── common/
│   │   ├── decorators/           # @CurrentUser(), @Roles()
│   │   ├── guards/               # RolesGuard, SubscriptionGuard
│   │   ├── interceptors/         # LoggingInterceptor, TransformInterceptor
│   │   ├── pipes/                # ValidationPipe customizado
│   │   └── filters/              # GlobalExceptionFilter
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── aws.config.ts
│   │
│   ├── prisma/
│   │   └── prisma.service.ts
│   │
│   └── main.ts
│
├── prisma/
│   ├── schema.prisma             # Schema completo do banco
│   ├── migrations/               # Histórico de migrations
│   └── seed.ts                   # Seed com TACO + dados de teste
│
├── test/
│   └── app.e2e-spec.ts
│
├── .github/
│   └── workflows/
│       ├── ci.yml                # Lint + test em PRs
│       └── deploy.yml            # Deploy automático na main
│
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

---

## Endpoints principais

### Autenticação
```
POST /auth/register          Cadastro (nutri ou atleta)
POST /auth/login             Login → { accessToken, refreshToken }
POST /auth/refresh           Renovar access token
POST /auth/logout            Invalidar refresh token
GET  /auth/me                Dados do usuário autenticado
```

### Nutricionista
```
GET  /nutritionist/me                    Perfil próprio
PUT  /nutritionist/me                    Atualizar perfil
GET  /nutritionist/athletes              Listar atletas
GET  /nutritionist/alerts                Alertas ativos
PUT  /nutritionist/alerts/:id/dismiss    Dispensar alerta
```

### Atleta
```
GET  /athlete/me              Perfil próprio
POST /athlete/anamnesis       Criar/atualizar anamnese
GET  /athlete/anamnesis       Buscar anamnese
```

### Plano alimentar
```
POST /meal-plan                          Criar plano
GET  /meal-plan/:id                      Buscar plano
PUT  /meal-plan/:id                      Atualizar plano
POST /meal-plan/:id/activate             Ativar plano
GET  /athlete/:id/meal-plan/active       Plano ativo do atleta
POST /meal-plan/:id/meal                 Adicionar refeição
POST /meal-plan/:id/meal/:mealId/food    Adicionar alimento
```

### Periodização
```
POST /periodization/rules/:mealPlanId    Configurar regras (nutri)
GET  /periodization/rules/:mealPlanId    Buscar regras
GET  /periodization/today/:athleteId     Macros do dia (ajustadas)
POST /periodization/log                  Registrar treino do dia
```

### Check-in
```
POST /check-in                    Atleta faz check-in
GET  /check-in/my                 Histórico do atleta
GET  /check-in/athlete/:id        Histórico (para nutri)
GET  /check-in/athlete/:id/latest Check-in mais recente
```

### Alimentos
```
GET /food/search?q=frango         Busca fuzzy na tabela TACO
GET /food/:id                     Detalhes de um alimento
```

---

## Engine de periodização

O diferencial técnico do FuelMatch. Documentação completa na [Wiki →](https://github.com/fuelmatch-app/fuelmatch-api/wiki/Periodization-Engine)

Fluxo resumido:
```
Nutri configura regras no plano
       ↓
Atleta registra treino do dia (heavy | moderate | light | rest)
       ↓
PeriodizationService calcula:
  macros_do_dia = macros_base × multiplicadores[tipo_treino]
       ↓
App exibe plano ajustado para o dia
```

---

## Testes

```bash
# Rodar todos os testes com cobertura
npm run test:cov

# Cobertura mínima exigida pelo CI: 70%
# Módulos críticos (periodization, meal-plan): meta de 90%
```

---

## CI/CD

- **CI** (todo PR para `develop`): lint + testes + build
- **CD** (merge na `main`): build Docker → push ECR → deploy EC2 → migrate → health check
- Tempo médio de deploy: ~3 minutos
- Rollback: `docker-compose up` com a tag anterior no EC2

---

## Contribuindo

1. Criar branch a partir de `develop`: `git checkout -b feature/42-nome-da-feature`
2. Implementar + testes
3. `npm run lint && npm run test` devem passar
4. Abrir PR para `develop` com template preenchido
5. Aguardar 1 aprovação + CI verde

---

## Licença

Proprietário — FuelMatch © 2025. Todos os direitos reservados.
