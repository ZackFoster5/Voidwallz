#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
MODE="${MODE:-dev}" # dev or start

# Determine the command to run the app
if [ "$MODE" = "dev" ]; then
  APP_CMD="npm run dev"
else
  APP_CMD="npm run start"
fi

echo "[tunnel] Using PORT=$PORT MODE=$MODE"
LOG_FILE="/tmp/voidwallz-cloudflared.log"
: > "$LOG_FILE"

# Check cloudflared
if ! command -v cloudflared >/dev/null 2>&1; then
  echo "[tunnel] cloudflared is not installed. Install with: brew install cloudflared" >&2
  exit 1
fi

# Start app in background
$APP_CMD &
APP_PID=$!

echo "[tunnel] Started app (pid $APP_PID). Waiting for http://localhost:$PORT ..."
# Wait for port to be ready (up to 60s)
for i in $(seq 1 60); do
  if nc -z localhost "$PORT" >/dev/null 2>&1; then
    echo "[tunnel] App is up on port $PORT. Starting Cloudflare Tunnel..."
    break
  fi
  sleep 1
  if ! kill -0 "$APP_PID" >/dev/null 2>&1; then
    echo "[tunnel] App process exited early. Aborting." >&2
    exit 1
  fi
  if [ "$i" -eq 60 ]; then
    echo "[tunnel] Timeout waiting for app on port $PORT" >&2
    exit 1
  fi
done

cleanup() {
  echo "\n[tunnel] Shutting down..."
  kill -TERM "$APP_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

# Start tunnel and print public URL once available
cloudflared tunnel --url "http://localhost:$PORT" --loglevel info --logfile "$LOG_FILE" &
CF_PID=$!

# Extract the public URL once and print it clearly
for i in $(seq 1 30); do
  URL=$(grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_FILE" | head -n1 || true)
  if [ -n "${URL:-}" ]; then
    echo "[tunnel] Share URL: $URL"
    break
  fi
  sleep 1
done

# Stream logs (optional). Comment out if too noisy.
tail -f "$LOG_FILE" &
TAIL_PID=$!

wait $CF_PID
kill -TERM $TAIL_PID >/dev/null 2>&1 || true
