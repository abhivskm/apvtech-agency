#!/bin/sh
# Vercel build: apply migrations, seed a brand-new database once, then build.
# Neon (via the Vercel integration) provides DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED (direct);
# migrations must use the direct connection.
#
# Preview deployments share the production database, so ONLY production builds may change it.
# A preview that needs a new migration fails its build instead of altering live data.
set -e
export DIRECT_DATABASE_URL="${DIRECT_DATABASE_URL:-${DATABASE_URL_UNPOOLED:-$DATABASE_URL}}"
if [ "$VERCEL_ENV" = "production" ]; then
  npx prisma migrate deploy
  SEED_ONLY_IF_EMPTY=true npx tsx prisma/seed.ts
else
  echo "Skipping migrations and seed: VERCEL_ENV=${VERCEL_ENV:-unset} (only production builds change the database)."
fi
npm run build
