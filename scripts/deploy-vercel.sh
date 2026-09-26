#!/usr/bin/env bash
set -euo pipefail

echo "→ Linking Vercel project (if needed)..."
npx vercel link --project topcreator-in --yes 2>/dev/null || true

echo ""
echo "→ Add Neon Postgres (skip if already connected):"
echo "  npx vercel integration add neon --plan free_v3 -m region=iad1 -m auth=false"
echo ""

echo "→ Deploying to production..."
npx vercel --prod --yes

echo ""
echo "→ After deploy, seed the database:"
echo "  vercel env pull .env.production"
echo "  export \$(grep -v '^#' .env.production | xargs)"
echo "  npm run db:push && npm run db:seed"
