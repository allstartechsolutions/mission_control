#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/service-common.sh"

load_env
install_service_unit
stop_stale_processes

log "Starting $SERVICE_NAME"
systemctl --user restart "$SERVICE_NAME"
wait_for_http
log "Mission Control is live at $APP_URL"
