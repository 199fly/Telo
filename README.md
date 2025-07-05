# TELO - Telegram-Based Mindful Assistant

## Project Overview

TELO is a minimalist, Telegram-based assistant that helps users become more self-aware, intentional, and consistent with their personal habits, journaling, and work/break cycles. It functions as a conversational behavioral companion that operates entirely within Telegram. The backend is powered by **Node.js** and **PocketBase**, making it easy to deploy, fast to build, and scalable for future enhancements.

TELO is designed to support a vision of **conscious work and living**, encouraging users to act, reflect, and grow with intention throughout their day.

---

## Core Philosophy

> "What is measured improves. What is repeated becomes part of you."

TELO is designed to:

* Anchor users with a personal goal and daily inspirational quotes
* Guide them through reflection via journaling routines
* Provide Pomodoro-style work and break sessions
* Track custom habits throughout the day

---

## Tech Stack

* **Frontend**: Telegram Bot (using [Telegraf.js](https://telegraf.js.org/))
* **Backend**: Node.js with PocketBase (local-first database with REST/Realtime support)
* **Storage**: PocketBase collections for users, habits, journal entries, work logs, etc.
* **Hosting Options**: Railway, Render, Fly.io, or local dev using ngrok

---

## Major Features

### 1. User Onboarding

* Triggered via `/start`
* Prompts user to set a personal goal
* Prompts user to add 1-3 quotes
* Prompts user to add 1 good habit and 1 bad habit
* Saves data into `users` collection in PocketBase

### 2. Work Mode (Aware Pomodoro)

* User chooses a total session length (e.g., 2 hours)
* User chooses sprint length (e.g., 25 minutes)
* After each sprint:

  * User logs how they felt
  * Bot suggests a break from a random list
  * Break duration is chosen (e.g., 5 mins)
  * Loop continues until session ends

### 3. Break Mode

* User selects a break activity or receives a random one
* Selects break duration
* Optionally reflects after break

### 4. Journaling

* Two modes:

  * **View Mode**: Flip through entries day-by-day
  * **Write Mode**: Guided (morning/midday/evening) or free-form entry
* Entries are timestamped and stored in `journal_entries` collection

### 5. Habit Tracking

* User defines habits as good or bad
* Can log `+1` or `-1` at any time via buttons
* Counts reset daily (can be automated or triggered)
* Stored in `habit_logs` or inline under user object depending on scale

### 6. Dashboard

* Shows a summary of the current day:

  * Work time
  * Sprints completed
  * Breaks taken
  * Habit counts
  * Journal entries
* Supports flipping through dates with buttons

### 7. Utilities Section

* Manage habits, quotes, goals, work/break categories
* Export data
* Wipe/reset account

---

## PocketBase Collections Design

### `users`

* `id` (Telegram ID)
* `first_name`, `username`
* `goal`: string
* `quotes`: array of strings
* `habits`: array of objects `{ name, type, count_today }`
* `created_at`, `updated_at`

### `journal_entries`

* `id`, `user` (relation)
* `date`: string (YYYY-MM-DD)
* `type`: string ("Morning", "Evening", "Free")
* `content`: text

### `habit_logs` (if needed)

* `user` (relation)
* `habit_name`: string
* `date`: string
* `count`: number

### `work_sessions`

* `user` (relation)
* `date`
* `total_minutes`
* `sprint_count`
* `reflections`: array of short entries

---

## File Structure Example

```bash
/telo
├── index.js             # Entry point
├── bot.js               # Telegram bot logic using Telegraf
├── pb.js                # PocketBase SDK wrapper
├── workflows/
│   ├── onboarding.js
│   ├── journal.js
│   ├── habits.js
│   ├── workmode.js
│   ├── breakmode.js
│   └── dashboard.js
└── utils/
    └── time.js
```

---

## Development Roadmap

### 🛠 Phase 1: MVP – Core Awareness System (2–3 weeks)

**User Story**: As a new user, I want to onboard easily, track my habits, write in my journal, and focus during my work sessions so I can become more intentional in how I spend my day.

**Features**
- `/start` onboarding: set personal goal, add up to 3 quotes, define 1 good habit and 1 bad habit
- Work mode: choose total session and sprint length, reflect after each sprint, random break with selectable duration
- Break mode: choose break type and duration, optional reflection
- Habit tracking: view habits, +1/-1 logs, daily reset
- Journaling: Morning/Evening/Free entries with day navigation
- Dashboard: summary of work time, sprints, habits, journal entries
- **Technical Tasks**: PocketBase collections, Telegraf.js bot scaffolding, message templates, local testing via ngrok or Railway

### 🧪 Phase 2: Power Features – Personalization Layer (3–4 weeks)

**User Story**: As a regular user, I want to customize my journal routines, break types, and quote behavior so TELO feels more like a personal coach.

**Features**
- Custom journal routines with user questions
- Editable work and break categories
- Custom sprint and break durations
- Habit streaks and optional reminders
- Favorite quotes and rotation logic
- View journals by type and across days
- Export logs to CSV or Google Sheets
- Search journal entries
- **Technical Tasks**: new collections for routines, fields for work_types/break_types, enhance `/journal` and habit logic, implement `/export`, index journal content

### 🤖 Phase 3: Reflection + AI Companion (Optional Extension)

**User Story**: As a deep user, I want AI-driven reflections and summaries so TELO can provide insights from my data.

**Features**
- AI summaries of journal entries
- Weekly reports of work time, moods, habits
- Conversational replies after journaling
- Mood pattern recognition with insights
- Quote suggestions based on entry tone
- **Technical Tasks**: store AI responses, mood_tag and ai_summary fields, integrate OpenAI or local LLM, `/review` command

---

## Dev Tips for Junior Developers

* **Telegraf.js** has excellent docs and is beginner-friendly
* **PocketBase** can be self-hosted with one binary and provides REST & realtime APIs
* Focus on **one command at a time** — make `/start` onboarding work perfectly before moving to journal
* Use `console.log()` to debug payloads coming from Telegram
* Use environment variables to store your Telegram bot token and PocketBase URL
* Keep your `user_id` in every DB call to scope all actions

---

## Deployment with Nixpacks

1. Copy `.env.example` to `.env` and set your values.
2. Deploy to any platform supporting [Nixpacks](https://nixpacks.com/).
3. On start, `start.sh` launches PocketBase and the bot, imports `.dev/schema.json`, and seeds the admin if missing.


## Final Notes

TELO isn’t just another productivity tool. It’s a **daily reflection mirror**, a **mini-habit coach**, and a **guided awareness builder** — all inside Telegram.

When built right, this can scale into:

* A lightweight mental health tool
* A mindfulness training assistant
* A personal development SaaS with Telegram as the UI

Start simple. Build well. Stay human-focused.

> Want to focus? Breathe first. Then type `/work`.

