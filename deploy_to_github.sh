#!/bin/bash
# deploy_to_github.sh
# Copia o código gerado para o repo local e faz push
#
# Uso: ./deploy_to_github.sh
# Pré-requisito: rodar a partir da pasta onde está fuelmatch-api/

set -e

WORKSPACE="$HOME/Workspace/FuelMatch"
SOURCE="$(pwd)/fuelmatch-api"
TARGET="$WORKSPACE/fuelmatch-api"

GREEN='\033[0;32m'; NC='\033[0m'
log() { echo -e "${GREEN}✓${NC} $1"; }

echo "🔥 FuelMatch API — Deploy para GitHub"
echo "────────────────────────────────────"
echo "Origem: $SOURCE"
echo "Destino: $TARGET"
echo ""

# Verificar que o target existe
if [ ! -d "$TARGET" ]; then
  echo "❌ Repositório não encontrado em $TARGET"
  echo "   Clone primeiro: gh repo clone fuelmatch-app/fuelmatch-api $TARGET"
  exit 1
fi

cd "$TARGET"

# Criar branch da issue #1
git checkout -b feature/1-nestjs-init 2>/dev/null || git checkout feature/1-nestjs-init

# Copiar arquivos gerados (preservar .git)
rsync -av --exclude='.git' --exclude='node_modules' "$SOURCE/" "$TARGET/"

log "Arquivos copiados"

# Commitar
git add -A
git commit -m "feat(infra): initialize NestJS project with module structure

- Setup NestJS 10 with TypeScript strict mode
- Configure module structure: auth, users, nutritionist, athlete,
  meal-plan, food, periodization, check-in, notifications, payments
- Add Prisma ORM with complete database schema (all models + enums)
- Implement JWT auth with refresh token rotation
- Add global exception filter, transform interceptor
- Add CurrentUser and Roles decorators
- Add GitHub Actions CI/CD workflows
- Add Dockerfile (multi-stage) and docker-compose.yml
- Add auth unit tests (coverage >80%)

Closes #1
Closes #3"

git push origin feature/1-nestjs-init

echo ""
echo "────────────────────────────────────"
log "Push realizado!"
echo ""
echo "Próximos passos:"
echo "  1. Abrir PR: https://github.com/fuelmatch-app/fuelmatch-api/compare/feature/1-nestjs-init"
echo "  2. Revisar e fazer merge para develop"
echo "  3. Fechar issues #1 e #3 no GitHub"
echo "────────────────────────────────────"
