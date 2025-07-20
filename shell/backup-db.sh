#!/usr/bin/env bash
set -euo pipefail

# -- CONFIGURATION --
# For a hosted Supabase DB, use psql connection string:
DB_URL="${SUPABASE_DB_URL:-postgres://user:pass@host:5432/dbname}"
BACKUP_DIR="./backups"
TIMESTAMP="$(date +'%Y%m%dT%H%M%S')"
OUTFILE="$BACKUP_DIR/metawave_db_$TIMESTAMP.sql"

# -- SCRIPT START --
mkdir -p "$BACKUP_DIR"
echo "💾 Backing up database to $OUTFILE..."
pg_dump "$DB_URL" --format=custom --file="$OUTFILE"
echo "✅ Backup complete."
