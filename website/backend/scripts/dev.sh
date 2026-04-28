#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VENV_DIR="$ROOT_DIR/backend/.venv"

if [[ -d "$VENV_DIR" ]]; then
  source "$VENV_DIR/bin/activate"
fi

cd "$ROOT_DIR"
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
