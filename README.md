# Telo

Telo is a Telegram-based productivity bot that stores daily logs in [PocketBase](https://pocketbase.io). Routines are defined in JSON and executed inside Telegram. Each step can ask questions, present counters, or record data.

## Quick Start

1. Copy `.env.example` to `.env` and set your `BOT_TOKEN` and `POCKETBASE_URL`.
2. Start PocketBase and the bot via Docker:

```bash
docker-compose up --build
```

The bot listens on `BOT_TOKEN` and connects to your PocketBase instance.

### Telegram Connection

Create a new bot with [BotFather](https://t.me/BotFather) and paste the token in your `.env` file. Start a chat with your bot and send `/start`.

### Running Routines

Use `/run <routine_id>` to execute a routine stored in the `routines` collection. Example routines are in `telo/src/data/routines.json`.

## JSON Routines

Routines are arrays of steps. Each step has a `type` such as `question`, `message`, `counter`, or `log`. Values captured during a run are written to the `logs` collection with a date stamp.

## Development

- Source code lives in `telo/src`.
- Telegram handlers are in `telo/src/bot`.
- Routine and log helpers are in `telo/src/engine`.
- PocketBase API wrapper is in `telo/src/api`.

Run the bot locally with `pnpm start`.
