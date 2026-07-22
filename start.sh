#!/usr/bin/env bash
set -e

PORT="${PORT:-8000}"
export PORT
export PSPORT="$PORT"

# 1. Start Pokémon Showdown server in background
echo "🚀 Starting local Pokémon Showdown on port $PORT..."
cd pokemon-showdown
node pokemon-showdown start --skip-build "$PORT" >/dev/null 2>&1 &
SHOWDOWN_PID=$!
cd ..

# Clean up background process on exit
trap 'kill $SHOWDOWN_PID 2>/dev/null' EXIT INT TERM

# 2. Wait for Showdown server to become active and start responding
echo "⌛ Waiting for Pokémon Showdown to be ready..."
for i in {1..60}; do
  if curl -s "http://127.0.0.1:$PORT/" >/dev/null; then
    echo "✅ Pokémon Showdown is ready."
    break
  fi
  sleep 0.5
done

# Keep running AI.py in a loop. Disable exit on error for the loop.
set +e
while true; do
  echo "🤖 Starting Pokémon AI script..."
  python3 AI.py --provider puter --server localhost
  echo "🤖 AI script exited. Restarting in 1s..."
  sleep 1
done
