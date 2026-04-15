#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/service-common.sh"

log "Installing systemd user service: $SERVICE_NAME"
install_service_unit
systemctl --user enable "$SERVICE_NAME"
log "Installed to $UNIT_TARGET"
