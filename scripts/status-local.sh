#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/service-common.sh"

systemctl --user status "$SERVICE_NAME" --no-pager
