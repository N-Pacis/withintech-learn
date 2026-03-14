#!/usr/bin/env bash
# db_backup.sh — Dump PostgreSQL from the Docker container to the host machine.
#
# Install (on the server, run once as root or the deploy user):
#   chmod +x /path/to/infra/backup/db_backup.sh
#
# Add to crontab (`crontab -e`):
#   If the server clock is UTC:    0 23 * * *  /path/to/infra/backup/db_backup.sh
#   If the server clock is EAT:    0  2 * * *  /path/to/infra/backup/db_backup.sh
#
# Kigali = EAT (UTC+3).  02:00 EAT == 23:00 UTC.

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────

CONTAINER="withintech-learn_postgres"
DB_NAME="withintech_learn"

# Where dumps land on the HOST machine.
BACKUP_DIR="/opt/withintech-learn/backups/db"

# How many days of dumps to keep.
KEEP_DAYS=30

# Log file on the host.
LOG_FILE="/var/log/withintech-learn/db_backup.log"

# ── Load credentials ──────────────────────────────────────────────────────────
# Reads POSTGRES_USER and POSTGRES_PASSWORD from the .env at the repo root.
# You can also export them in the cron environment instead.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../../.env"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a
  source "$ENV_FILE"
  set +a
fi

: "${POSTGRES_USER:?POSTGRES_USER is not set — export it or ensure .env is readable}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is not set — export it or ensure .env is readable}"

# ── Helpers ───────────────────────────────────────────────────────────────────

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# ── Preflight ─────────────────────────────────────────────────────────────────

mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

log "──────────────────────────────────────────"
log "Starting DB backup  db=$DB_NAME  container=$CONTAINER"

# Verify the container is actually running before we try to dump.
RUNNING=$(docker inspect "$CONTAINER" --format '{{.State.Running}}' 2>/dev/null || echo "false")
if [[ "$RUNNING" != "true" ]]; then
  log "ERROR: Container '$CONTAINER' is not running — aborting."
  exit 1
fi

# ── Dump ──────────────────────────────────────────────────────────────────────

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
DUMP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

docker exec \
  -e PGPASSWORD="$POSTGRES_PASSWORD" \
  "$CONTAINER" \
  pg_dump \
    --username="$POSTGRES_USER" \
    --dbname="$DB_NAME" \
    --no-password \
    --format=plain \
    --clean \
    --if-exists \
  | gzip > "$DUMP_FILE"

SIZE=$(du -sh "$DUMP_FILE" | cut -f1)
log "Dump saved: $DUMP_FILE  ($SIZE)"

# ── Rotate old backups ────────────────────────────────────────────────────────

DELETED=$(find "$BACKUP_DIR" -maxdepth 1 -name "${DB_NAME}_*.sql.gz" -mtime +"$KEEP_DAYS" -print -delete | wc -l | tr -d ' ')
if [[ "$DELETED" -gt 0 ]]; then
  log "Rotated $DELETED old dump(s) older than $KEEP_DAYS days"
fi

log "Backup complete."
