#!/usr/bin/env bash
# Launcher for the Hudu local write connector (stdio MCP server).
#
# Invoked from Windows Claude Code via wsl.exe. A fresh wsl.exe spawn runs a
# non-interactive shell, where Ubuntu's ~/.bashrc returns early and never loads
# nvm. We therefore source nvm explicitly so node/tsx are on PATH. Keep all
# diagnostic output on stderr: stdout carries the JSON-RPC MCP protocol.
set -euo pipefail

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[hudu-local] node not found after sourcing nvm ($NVM_DIR). Check the node install." >&2
  exit 1
fi

# Run from the project root regardless of where wsl.exe started us.
cd "$(dirname "$0")/.."

exec ./node_modules/.bin/tsx src/local/index.ts
