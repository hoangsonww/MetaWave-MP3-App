#!/usr/bin/env bash
set -euo pipefail

# -- CONFIGURATION --
BACKUP_DIR="./backups"
KEEP=7

# -- SCRIPT START --
echo "🧹 Rotating backups, keeping latest $KEEP files..."
cd "$BACKUP_DIR"
ls -1tr | head -n -"${KEEP}" | xargs -r rm --
echo "✅ Rotation complete."
