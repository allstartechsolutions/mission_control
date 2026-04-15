#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-3001}"
PID_FILE="${PID_FILE:-$ROOT_DIR/.missioncontrol.pid}"
LOG_FILE="${LOG_FILE:-$ROOT_DIR/start.log}"
BUILD_LOG_FILE="${BUILD_LOG_FILE:-$ROOT_DIR/build.log}"
APP_URL="${APP_URL:-http://127.0.0.1:$PORT}"

stop_existing() {
  local stopped=0

  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(cat "$PID_FILE")"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      echo "Stopping existing Mission Control process (pid $pid)..."
      kill "$pid" 2>/dev/null || true
      for _ in {1..20}; do
        if ! kill -0 "$pid" 2>/dev/null; then
          break
        fi
        sleep 1
      done
      if kill -0 "$pid" 2>/dev/null; then
        echo "Process $pid did not exit cleanly, forcing stop..."
        kill -9 "$pid" 2>/dev/null || true
      fi
      stopped=1
    fi
    rm -f "$PID_FILE"
  fi

  mapfile -t leftover_pids < <(ps -eo pid=,args= | awk -v root="$ROOT_DIR" -v host="$HOST" -v port="$PORT" '
    index($0, root) && index($0, "next start") && index($0, host) && (index($0, "-p " port) || index($0, "--port " port)) { print $1 }
  ') || true
  for pid in "${leftover_pids[@]:-}"; do
    [[ -z "$pid" ]] && continue
    if [[ "$pid" != "$$" ]]; then
      echo "Stopping leftover Next.js process on port $PORT (pid $pid)..."
      kill "$pid" 2>/dev/null || true
      stopped=1
    fi
  done

  if [[ "$stopped" -eq 1 ]]; then
    sleep 2
  fi
}

wait_for_http() {
  for _ in {1..30}; do
    if curl -fsS "$APP_URL" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "Mission Control did not become ready at $APP_URL" >&2
  return 1
}

echo "==> Safe local deploy for Mission Control"
stop_existing

echo "Removing old .next build output..."
rm -rf .next

echo "Running production build..."
npm run build 2>&1 | tee "$BUILD_LOG_FILE"

echo "Starting fresh Next.js server on $HOST:$PORT ..."
nohup ./node_modules/.bin/next start --hostname "$HOST" --port "$PORT" >"$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"

wait_for_http

echo "Mission Control is live at $APP_URL (pid $NEW_PID)"
