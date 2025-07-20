#!/usr/bin/env bash
set -euo pipefail

# -- CONFIGURATION --
# If you want to use a local Supabase instance
USE_LOCAL_SUPABASE=true
SUPABASE_DIR="../supabase"

# -- SCRIPT START --
echo "🚀 Starting development environment..."

if [ "$USE_LOCAL_SUPABASE" = true ]; then
  echo "Starting Supabase emulators..."
  (cd "$SUPABASE_DIR" && supabase start) &
  sleep 5
fi

echo "Running Next.js in dev mode..."
yarn dev
