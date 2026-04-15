#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/service-common.sh"

load_env
install_service_unit

log "Stopping existing Mission Control service"
systemctl --user stop "$SERVICE_NAME" || true
stop_stale_processes

log "Installing dependencies"
npm ci

log "Removing old .next build output"
rm -rf "$ROOT_DIR/.next"

log "Running production build"
npm run build 2>&1 | tee "$BUILD_LOG_FILE"

log "Starting fresh service"
systemctl --user start "$SERVICE_NAME"
wait_for_http 60

log "Deployment finished. Mission Control is live at $APP_URL"
systemctl --user --no-pager --full status "$SERVICE_NAME" || true
