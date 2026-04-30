# FuelMatch API 🔥

Backend do FuelMatch — plataforma de nutrição esportiva com periodização dinâmica de macros para atletas de musculação.

## Stack

- **Runtime**: Node.js 20 + TypeScript
- **Framework**: NestJS 10
- **Banco de dados**: PostgreSQL 16 + Prisma ORM
- **Cache**: Redis (refresh tokens, rate limiting)
- **Cloud**: AWS (EC2, RDS, S3, CloudFront)
- **CI/CD**: GitHub Actions

## Setup local

### Pré-requisitos
- Node.js 20+
- Docker (para PostgreSQL e Redis local)
- AWS CLI configurado (opcional, para S3)

### Instalação

\`\`\`bash
# 1. Clonar o repositório
git clone https://github.com/fuelmatch-app/fuelmatch-api.git
cd fuelmatch-api

# 2. Instalar dependências
npm install

# 3. Subir PostgreSQL e Redis com Docker
docker-compose up -d

# 4. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 5. Rodar migrations
npx prisma migrate dev

# 6. Seed com dados iniciais (tabela TACO)
npm run db:seed

# 7. Iniciar em modo desenvolvimento
npm run start:dev
\`\`\`

### Variáveis de ambiente

\`\`\`env
# Banco de dados
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fuelmatch

# JWT
JWT_SECRET=seu-secret-aqui-minimo-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_REGION=sa-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=fuelmatch-dev-assets

# App
PORT=3000
NODE_ENV=development
\`\`\`

## Scripts

\`\`\`bash
npm run start:dev    # Desenvolvimento com hot reload
npm run build        # Build de produção
npm run test         # Testes unitários
npm run test:cov     # Testes com cobertura
npm run lint         # ESLint
npm run db:seed      # Popular banco com dados iniciais
\`\`\`

## Estrutura do projeto

\`\`\`text
src/
├── modules/
│   ├── auth/           # JWT, refresh tokens, guards
│   ├── users/          # Usuários base (nutri + atleta)
│   ├── nutritionist/   # Perfil e gestão de atletas
│   ├── athlete/        # Perfil e anamnese
│   ├── meal-plan/      # Criação e gestão de planos
│   ├── food/           # Banco de alimentos (TACO)
│   ├── periodization/  # Engine de ajuste de macros
│   ├── check-in/       # Check-in semanal + alertas
│   └── payments/       # Pagar.me, assinaturas
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/
└── main.ts
\`\`\`

## Documentação da API

Após iniciar, acessar: \`http://localhost:3000/docs\`

## Arquitetura de periodização

O coração do FuelMatch. A nutri configura multiplicadores por tipo de treino, e o sistema aplica automaticamente as macros corretas cada dia:

\`\`\`text
Plano base: 2.500kcal | P:190g | C:280g | G:75g

Treino pesado (×1.15 cal, ×1.30 carbs):
→ 2.875kcal | P:209g | C:364g | G:71g

Dia de descanso (×0.88 cal, ×0.75 carbs):
→ 2.200kcal | P:190g | C:210g | G:83g
\`\`\`

## Contribuindo

1. Fork o repositório
2. Criar branch:
   \`\`\`bash
   git checkout -b feature/123-descricao
   \`\`\`
3. Commit:
   \`\`\`bash
   git commit -m "feat(module): description"
   \`\`\`
4. Push:
   \`\`\`bash
   git push origin feature/123-descricao
   \`\`\`
5. Abrir Pull Request para \`develop\`

## Licença

Proprietário — FuelMatch © 2025
