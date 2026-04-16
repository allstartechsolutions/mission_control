#!/usr/bin/env bash
set -euo pipefail

export SERVICE_NAME="mission-control-dev.service"
export UNIT_SOURCE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/deploy/systemd/mission-control-dev.service"
export ENV_FILE=".env.development.local"

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/install-service.sh"
