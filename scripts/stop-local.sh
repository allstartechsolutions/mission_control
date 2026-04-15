#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/service-common.sh"

if service_exists; then
  log "Stopping $SERVICE_NAME"
  systemctl --user stop "$SERVICE_NAME" || true
fi

stop_stale_processes
log "Stopped Mission Control"
