#!/usr/bin/env bash
set -e

PORT="${PORT:-8000}"
export PORT
export PSPORT="$PORT"

echo "🤖 Starting Pokémon AI backend (Showdown will be started by AI)..."
python3 AI.py --provider puter --server localhost
