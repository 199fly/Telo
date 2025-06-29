# 🧠 Telo – Telegram Productivity Bot

**Telo** is a stateless, menu-based Telegram bot built with Node.js (`telegraf`) and PocketBase to help you:

- Reflect through journal prompts
- Plan your day
- Run work cycles
- Take intentional breaks
- Save and manage inspirational quotes

It uses inline buttons, a clean callback system, and stores data via PocketBase’s REST API. Ideal for anyone seeking a minimalist productivity assistant.

---

## 🚀 Features

- 🧭 Stateless Telegram menu navigation
- ✍️ Journal routines (e.g. Morning, Evening)
- 💼 Work mode setup: task, duration, cycles
- ☕ Break mode: select type and time
- 💬 Quotes: view, create, delete
- 🔌 PocketBase backend (self-hosted)
- 🌐 Deployed via Dokploy (free-tier friendly)

---

## 📂 Folder Structure

```
telegram_pocketbase_bot/
├── index.js                      # Core bot logic
├── package.json                  # Node dependencies
├── .env.example                  # Sample env variables
├── Procfile                      # Dokploy process config
├── pb_schema_journal_entries.json # PocketBase collection schema
└── README.md
```

---

## 🔧 Environment Setup

1. **Install dependencies**

```bash
npm install
```

2. **Copy and configure your .env file**

```bash
cp .env.example .env
```

Update it with:

```env
BOT_TOKEN=your_telegram_bot_token
POCKETBASE_URL=http://your-pocketbase-url
```

---

## 🧠 How It Works

This bot uses inline buttons with `callback_data` like:

```
flow=journal;step=1
```

Your bot parses this data and decides what to show next, using logic in `index.js`.

Only important entries like **journal submissions** or **quotes** are stored in PocketBase.

---

## 💾 PocketBase Setup

1. Download from [https://pocketbase.io](https://pocketbase.io)
2. Run it locally:

```bash
./pocketbase serve
```

3. Import the schema:

- Go to `http://localhost:8090/_/`
- Create collection using fields from `pb_schema_journal_entries.json`

---

## ☁️ Deploying to Dokploy

1. Push this project to GitHub
2. Go to [dokploy.io](https://dokploy.io)
3. Connect your GitHub repo
4. Set environment variables:
   - `BOT_TOKEN`
   - `POCKETBASE_URL`
5. Dokploy will auto-deploy your bot

---


## 📄 License

MIT – free to use and extend.
