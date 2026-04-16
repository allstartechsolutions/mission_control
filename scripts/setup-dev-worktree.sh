#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEV_DIR="${DEV_DIR:-/home/jr/MissionControl-dev}"
DEV_BRANCH="${DEV_BRANCH:-develop}"
BASE_BRANCH="${BASE_BRANCH:-master}"

if [[ -e "$DEV_DIR" ]]; then
  echo "Refusing to continue: $DEV_DIR already exists." >&2
  exit 1
fi

cd "$ROOT_DIR"

echo "Creating dev worktree at $DEV_DIR on branch $DEV_BRANCH (from $BASE_BRANCH)"

git fetch origin

if git show-ref --verify --quiet "refs/heads/$DEV_BRANCH"; then
  git worktree add "$DEV_DIR" "$DEV_BRANCH"
else
  git worktree add -b "$DEV_BRANCH" "$DEV_DIR" "$BASE_BRANCH"
fi

if [[ -f "$ROOT_DIR/.env.development.example" && ! -f "$DEV_DIR/.env.development.local" ]]; then
  cp "$ROOT_DIR/.env.development.example" "$DEV_DIR/.env.development.local"
  echo "Seeded $DEV_DIR/.env.development.local from .env.development.example"
fi

echo "Done. Review env values before starting the dev service."
