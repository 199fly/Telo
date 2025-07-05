#!/usr/bin/env bash
set -e

# load environment variables if .env is present
if [ -f .env ]; then
  set -a
  . ./.env
  set +a
elif [ -f .env.example ]; then
  set -a
  . ./.env.example
  set +a
fi

PB_DIR="${PB_DIR:-pb_data}"
mkdir -p "$PB_DIR"

# ensure pocketbase binary is executable
chmod +x pocketbase/pocketbase

# ensure admin account exists
./pocketbase/pocketbase superuser upsert "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD" --dir "$PB_DIR"

# start pocketbase
./pocketbase/pocketbase serve --http 0.0.0.0:8090 --dir "$PB_DIR" &
PB_PID=$!

export POCKETBASE_URL=${POCKETBASE_URL:-http://127.0.0.1:8090}

# wait for pb to be up then import schema and seed data
node scripts/initPocketBase.js

# start the Telegram bot
node index.js &
NODE_PID=$!

wait -n $NODE_PID $PB_PID
