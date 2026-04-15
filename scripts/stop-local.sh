#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PID_FILE="${PID_FILE:-$ROOT_DIR/.missioncontrol.pid}"

if [[ ! -f "$PID_FILE" ]]; then
  echo "No Mission Control PID file found."
  exit 0
fi

PID="$(cat "$PID_FILE")"
if [[ -n "$PID" ]] && kill -0 "$PID" 2>/dev/null; then
  echo "Stopping Mission Control process $PID..."
  kill "$PID"
  for _ in {1..20}; do
    if ! kill -0 "$PID" 2>/dev/null; then
      rm -f "$PID_FILE"
      echo "Stopped."
      exit 0
    fi
    sleep 1
  done
  echo "Process $PID did not exit cleanly, forcing stop..."
  kill -9 "$PID" 2>/dev/null || true
fi

rm -f "$PID_FILE"
echo "Stopped."
