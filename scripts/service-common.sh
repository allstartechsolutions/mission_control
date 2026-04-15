#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_NAME="${SERVICE_NAME:-mission-control.service}"
SYSTEMD_USER_DIR="${SYSTEMD_USER_DIR:-$HOME/.config/systemd/user}"
UNIT_SOURCE="${UNIT_SOURCE:-$ROOT_DIR/deploy/systemd/$SERVICE_NAME}"
UNIT_TARGET="${UNIT_TARGET:-$SYSTEMD_USER_DIR/$SERVICE_NAME}"
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-3001}"
APP_URL="${APP_URL:-http://127.0.0.1:$PORT}"
BUILD_LOG_FILE="${BUILD_LOG_FILE:-$ROOT_DIR/build.log}"

log() {
  echo "==> $*"
}

ensure_systemd_user() {
  if ! systemctl --user --version >/dev/null 2>&1; then
    echo "systemctl --user is required but unavailable." >&2
    exit 1
  fi
}

load_env() {
  if [[ -f "$ROOT_DIR/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$ROOT_DIR/.env"
    set +a
  fi
}

service_exists() {
  systemctl --user list-unit-files "$SERVICE_NAME" --no-legend 2>/dev/null | grep -q "^$SERVICE_NAME"
}

install_service_unit() {
  ensure_systemd_user
  mkdir -p "$SYSTEMD_USER_DIR"
  install -m 0644 "$UNIT_SOURCE" "$UNIT_TARGET"
  systemctl --user daemon-reload
}

extract_pids_from_ss() {
  local port="$1"
  ss -ltnpH "( sport = :$port )" 2>/dev/null \
    | grep -o 'pid=[0-9]\+' \
    | cut -d= -f2 \
    | sort -u || true
}

stop_stale_processes() {
  mapfile -t pids < <(extract_pids_from_ss "$PORT")
  if [[ "${#pids[@]}" -eq 0 ]]; then
    return 0
  fi

  log "Stopping stale listeners on port $PORT: ${pids[*]}"
  kill "${pids[@]}" 2>/dev/null || true
  sleep 2

  mapfile -t stubborn < <(extract_pids_from_ss "$PORT")
  if [[ "${#stubborn[@]}" -gt 0 ]]; then
    log "Force stopping stubborn listeners on port $PORT: ${stubborn[*]}"
    kill -9 "${stubborn[@]}" 2>/dev/null || true
    sleep 1
  fi
}

wait_for_http() {
  local tries="${1:-45}"
  for _ in $(seq 1 "$tries"); do
    if curl -fsS "$APP_URL" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "Mission Control did not become ready at $APP_URL" >&2
  return 1
}
