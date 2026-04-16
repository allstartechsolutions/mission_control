#!/usr/bin/env bash
set -euo pipefail

export SERVICE_NAME="mission-control-dev.service"
export PORT="3002"
export APP_URL="http://127.0.0.1:3002"
export ENV_FILE=".env.development.local"

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/stop-local.sh"
