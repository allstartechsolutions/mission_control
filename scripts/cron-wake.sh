#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

APP_URL="${CRON_WAKE_URL:-${INTERNAL_APP_URL:-http://127.0.0.1:3001}}"
WAKE_URL="${APP_URL%/}/api/cron/wake"
CRON_TOKEN="${CRON_SECRET:-${AUTH_SECRET:-${NEXTAUTH_SECRET:-}}}"

if [[ -z "$CRON_TOKEN" ]]; then
  echo "Missing CRON_SECRET/AUTH_SECRET/NEXTAUTH_SECRET" >&2
  exit 1
fi

curl --fail --silent --show-error \
  -X POST \
  -H "Authorization: Bearer ${CRON_TOKEN}" \
  "$WAKE_URL"
