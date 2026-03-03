#!/usr/bin/env bash
set -euo pipefail

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

PB_DIR="${PB_DIR:-pb_data}"
PB_ADMIN_EMAIL="${PB_ADMIN_EMAIL:-enkerabahizi@gmail.com}"
PB_ADMIN_PASSWORD="${PB_ADMIN_PASSWORD:-TeloAdmin123}"
PB_HOST="${PB_HOST:-127.0.0.1}"
PB_PORT="${PB_PORT:-8090}"
POCKETBASE_URL="http://${PB_HOST}:${PB_PORT}"

mkdir -p "$PB_DIR"

function wait_for_pocketbase() {
  local health_url="${POCKETBASE_URL%/}/api/health"
  local attempts=20
  local i
  printf 'Waiting for PocketBase health'
  for i in $(seq 1 "$attempts"); do
    if curl --silent --fail "$health_url" >/dev/null; then
      printf ' ok\n'
      return
    fi
    printf '.'
    sleep 1
  done
  printf ' failed\n'
  echo "PocketBase did not respond at $health_url after $attempts seconds" >&2
  exit 1
}

function is_port_listening() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi
  ss -ltn "sport = :$port" | tail -n +2 | grep -q ":$port"
}

# ensure pocketbase binary is executable
chmod +x pocketbase/pocketbase

# ensure admin account exists
./pocketbase/pocketbase superuser upsert "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD" --dir "$PB_DIR"

# start a PocketBase server instance if not already running
PB_PID=""
if is_port_listening "$PB_PORT"; then
  echo "PocketBase already running on port $PB_PORT, reusing existing instance."
else
  ./pocketbase/pocketbase serve --http 0.0.0.0:"$PB_PORT" --dir "$PB_DIR" &
  PB_PID=$!
fi
trap '[[ -n "${NODE_PID:-}" ]] && kill "$NODE_PID"; [[ -n "${PB_PID:-}" ]] && kill "$PB_PID"' EXIT

export POCKETBASE_URL

# wait for pb to be healthy before bootstrapping
wait_for_pocketbase

# import schema and seed data
node scripts/initPocketBase.js

# start the Telegram bot
node index.js &
NODE_PID=$!

wait -n "$NODE_PID" "$PB_PID"
