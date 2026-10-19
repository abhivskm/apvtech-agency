#!/bin/sh
# Vercel build: apply migrations, seed a brand-new database once, then build.
# Neon (via the Vercel integration) provides DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED (direct);
# migrations must use the direct connection.
set -e
export DIRECT_DATABASE_URL="${DIRECT_DATABASE_URL:-${DATABASE_URL_UNPOOLED:-$DATABASE_URL}}"
npx prisma migrate deploy
SEED_ONLY_IF_EMPTY=true npx tsx prisma/seed.ts
npm run build
