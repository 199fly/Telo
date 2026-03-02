TELO — Telegram-Based Mindful Assistant

Project Overview

TELO is a minimalist, Telegram-based behavioral assistant designed to help users become more self-aware, intentional, and consistent in how they work, reflect, and live.

It operates entirely inside Telegram as a conversational system powered by:

Node.js (execution + orchestration layer)

Telegraf.js (Telegram bot framework)

PocketBase (lightweight, self-hosted database)


TELO is not just a productivity tool. It is a semantic behavioral system built around structured routines, atomic interaction blocks, and a unified tagging model that allows meaning to persist across user actions.


---

Core Philosophy

> "What is measured improves. What is repeated becomes identity."



TELO is designed to:

Anchor users with a meaningful goal

Reinforce intention with rotating quotes

Guide structured journaling

Run mindful work/break cycles

Track habits with semantic consistency

Build an analyzable behavioral history


The system is designed for long-term composability. Every interaction produces structured, semantically tagged data that can later power analytics and AI insight.


---

Architectural Philosophy

TELO is built on five core layers:

[ Blocks ] → Behavioral UI logic
[ Routines ] → Structured execution flows
[ Block Entries ] → Atomic user data
[ Tags Registry ] → Semantic meaning layer
[ External Data ] → Tag-indexed content & integrations

Each layer has a strict responsibility.


---

1. Blocks (Behavioral Primitives)

Blocks are executable UI templates.

A block defines:

Prompt text

Input type (text, number, select, timer, display)

Optional options

Tags (semantic meaning)

UI hints (countdown, emoji scale, random mode)

Reply handling logic (in Node backend)


Examples:

Mood rating block

Gratitude journal block

Countdown timer block

Stretch suggestion block

Habit increment block


Blocks do not store user data directly.
They only define how to collect or display it.


---

2. Routines (Structured Flows)

Routines are ordered sequences of blocks.

Examples:

Morning Reflection

Work Session (Pomodoro Loop)

Break Session

Daily Check-In

Evening Journal


Routines orchestrate behavior.
Blocks execute within routines.
User replies are stored as entries.


---

3. Block Entries (Single Source of Truth)

Every user interaction produces a block entry.

This is the only activity log.

Each entry contains:

User reference

Routine reference (optional)

Block reference (optional but recommended)

Tags

Value

Metadata

Timestamp

Semantic key (for overwrite rules)


There are no separate “journal_entries”, “habit_logs”, or “work_sessions” tables.

All behavior logs live inside block_entries.

This ensures:

Unified analytics

Consistent semantics

Future AI compatibility



---

4. Tags Registry (Semantic Dictionary)

Tags define meaning.

The tag registry acts as the system’s vocabulary.

Each tag defines:

Value type (number, text, select, timer)

Semantic dimensions (e.g., rest.daily, mood.session)

Uniqueness rule (append, overwrite_per_day, overwrite_active)

External data connection (if any)

Description


Tags unify:

Blocks

Entries

External data

Analytics


This allows AI and reporting systems to reason across routines.


---

5. External Data (Tag-Indexed Content Layer)

External data stores reusable or integrated datasets.

Examples:

Stretch library

Quote library

Break activity list

Sleep integration feed

User-created custom lists


External data is indexed by tags.

Blocks fetch external data by tag when needed (e.g., random stretch suggestion).


---

Why This Architecture Matters

This model ensures:

No duplicated semantic meaning

Composable routines

Clean event log design

Scalable analytics

AI-ready data structures

Easy feature expansion


TELO is built as a semantic behavioral engine — not a collection of disconnected feature tables.


Major Features (Built on the Block + Routine Model)

All features in TELO are implemented using blocks, routines, and tagged entries.


---

1. User Onboarding (/start)

On first interaction, TELO:

1. Asks what the user wants to be called.


2. Prompts for a personal goal.


3. Prompts to add 1–3 favorite quotes.


4. Prompts to define:

1 good habit

1 bad habit



5. Asks whether to enable:

Morning routine

Night routine

Automatic check-in




The onboarding routine seeds:

User record

Default routines

Default block configuration

User-scoped external data (quotes, custom habits)


Goals are stored using a tag like:

goal.active

with an overwrite rule of one active goal per user.

Quotes are stored as external data entries indexed by:

quote.user


---

2. Work Mode (Aware Pomodoro)

Work Mode is a structured routine composed of:

Countdown block (timer)

Sprint reflection block (number or text)

Break suggestion block (random external data fetch)

Optional post-break reflection block


Flow:

1. User selects total duration.


2. User selects sprint length.


3. Sprint countdown runs.


4. User logs focus/mood.


5. Random break activity suggested.


6. Loop continues until session ends.



Each sprint produces block entries tagged:

work.sprint
mood.session
break.activity

All sprint reflections and break logs are unified by tags.

There is no separate work_sessions table.


---

3. Break Mode

Break Mode can run standalone.

Blocks:

Random break suggestion (external data)

Duration selection

Optional reflection


Break suggestions are pulled from external_data by tag:

break.library
stretch.library

Break logs are stored as entries tagged:

break.activity
movement.break


---

4. Journaling

Journaling is block-based.

Types:

Morning

Midday

Evening

Free


Each journal block produces entries tagged:

journal.morning
journal.evening
journal.free

Journal browsing queries block entries filtered by:

User

Tag

Date


No separate journal table exists.


---

5. Habit Tracking

Habits are defined as tagged semantic entities.

Example tags:

habit.water
habit.exercise
habit.smoking

Logging +1 or -1 creates block entries tagged with that habit.

Daily totals are computed from entries for that date.

If overwrite behavior is desired, entries use a computed:

semantic_key = habit.water|2026-03-02

Overwrite logic is enforced in backend logic.

Habits are not stored as inline counters in the user record.
They are derived from entries.


---

6. Dashboard

Dashboard is a query layer.

It aggregates:

Total sprint minutes

Sprint count

Break count

Habit counts

Journal entries

Active goal

Rotating quote


All values are derived from block_entries and external_data.

The dashboard never writes data.


---

7. Utilities

Utilities operate on:

Editing routines

Managing habits (creates new habit tags)

Managing quotes (updates external_data)

Exporting entries

Resetting account (delete user + entries)


Export is a transformation of block_entries.


---

PocketBase Collections (Core Schema)

TELO uses five primary collections.


---

1. blocks

Behavior definitions.

Fields:

id

name

type

prompt

options (json)

tags (json array)

meta (json)

created


Note: Execution logic lives in Node.js. PocketBase stores configuration only.


---

2. routines

Flow definitions.

Fields:

id

name

blocks (json array of block references)

tags

meta

created



---

3. block_entries (Event Log)

Single source of truth for user data.

Fields:

id

user (relation)

routine (relation, optional)

block (relation, optional)

tags (json array)

value (json)

meta (json)

semantic_key (string)

created (datetime)


semantic_key is used for overwrite logic.

Example:

sleep.daily|2026-03-02
goal.active|user123

Overwrite logic is handled in backend before insert.


---

4. tags_registry

Semantic dictionary.

Fields:

id

tag

value_type

semantic_dimensions (json array)

uniqueness_rule (append, overwrite_per_day, overwrite_active)

external_source_tags (json array)

description

aliases

created


This enables:

Semantic consistency

AI reasoning

Cross-routine analytics



---

5. external_data

Reusable or integrated datasets.

Fields:

id

tags (json array)

type (static, dynamic, integration)

value (json)

source

meta

created


Examples:

Stretch library

Quote library

Break activities

Sleep API integration

User-defined lists

#######

Here is CHUNK 3 of 3 — copy/paste ready.


---

Development Roadmap

Phase 1 — Core Behavioral Engine (MVP)

Goal: Launch a stable, fully functional awareness assistant built on the semantic block system.

Deliverables

/start onboarding routine

Goal capture (overwrite_active rule)

User quotes stored in external_data

Habit creation via tagged entries

Morning and Evening journal routines

Work mode with sprint timer

Random break suggestions from external_data

Dashboard aggregation

semantic_key overwrite enforcement

Basic export (JSON/CSV)


Technical Focus

Implement executeRoutine() engine

Implement runBlock() handler

Implement overwrite logic using semantic_key

Seed default blocks, routines, tags_registry, and external_data

Local dev via ngrok or Railway

Deploy via Nixpacks


MVP must prove:

All behavior flows through block definitions

All user data flows into block_entries

All meaning flows through tags_registry


No feature-specific tables.


---

Phase 2 — Personalization Layer

Goal: Allow users to customize routines and semantic domains.

Features

Custom user routines

Custom journal questions

Custom break categories

Custom sprint durations

Habit streak visualization

Tag-based search across entries

Export by tag

Routine scheduling (time-based triggers)

Quote rotation logic


Technical Enhancements

Add routine scheduling in meta

Add trigger execution layer

Improve dashboard aggregation queries

Add indexing to block_entries by:

user

created

semantic_key


Add search index for journal tags



---

Phase 3 — Reflection + AI Companion

Goal: Enable TELO to reason over user data.

Features

Weekly summary generation

Mood pattern detection

Habit trend detection

Goal progress insight

Conversational reflection after journaling

Quote suggestions based on mood

Adaptive break recommendations


Technical Requirements

Store AI summaries as entries tagged:

ai.summary.weekly
ai.reflection.journal

Use tags_registry as semantic ontology for AI prompts

Implement aggregation layer:

average per tag

sum per tag

frequency analysis


Add /review command for periodic summaries


AI works because:

Data is atomic

Tags unify meaning

Entries are structured

Routines create predictable behavioral patterns



---

File Structure

/telo
├── index.js
├── bot.js
├── pb.js
├── engine/
│   ├── executeRoutine.js
│   ├── runBlock.js
│   ├── semanticKey.js
│   └── scheduler.js
├── blocks/
│   ├── mood.js
│   ├── journal.js
│   ├── timer.js
│   ├── stretch.js
│   └── habit.js
├── routines/
│   ├── onboarding.js
│   ├── morning.js
│   ├── work.js
│   └── break.js
├── tags/
│   └── registry.json
├── seed/
│   ├── blocks.json
│   ├── routines.json
│   ├── tags.json
│   └── external_data.json
└── utils/
    └── time.js


---

Execution Engine Concept

Routine Execution

executeRoutine(user, routineId)

1. Fetch routine


2. Iterate blocks in order


3. Render block


4. Capture reply


5. Build entry object


6. Compute semantic_key


7. Enforce overwrite rule


8. Persist to block_entries


9. Continue until complete




---

Overwrite Logic

Before inserting a new entry:

Check tag's uniqueness_rule

Compute semantic_key

If overwrite rule applies:

Find existing entry by (user + semantic_key)

Update instead of insert



This ensures:

One sleep entry per day

One active goal per user

Multiple mood entries per session

Append-only journaling



---

Deployment

Using Nixpacks

1. Copy .env.example → .env


2. Set:

TELEGRAM_BOT_TOKEN

POCKETBASE_URL

ADMIN_EMAIL

ADMIN_PASSWORD



3. Deploy to:

Railway

Render

Fly.io

Dokploy



4. On startup:

Launch PocketBase

Import schema

Seed blocks, routines, tags, external data

Start bot





---

Design Principles

TELO must remain:

Minimal

Structured

Semantic

Composable

Event-driven

AI-ready


Never create feature-specific tables unless absolutely required.

Everything flows through:

Blocks

Routines

Entries

Tags

External Data



---

Future Scaling Vision

TELO can evolve into:

Mindfulness SaaS

AI-assisted reflection engine

Habit analytics platform

Lightweight mental health companion

Cross-platform behavioral OS


Telegram is just the interface.

The real product is the semantic behavioral engine underneath.


---

Final Note

TELO is not about productivity.

It is about conscious repetition.

It helps users:

Pause

Act intentionally

Reflect

Improve

Repeat


When implemented correctly, the system becomes a mirror.

Start simple. Build clean. Keep semantics pure.


TELO Execution Engine Spec
Goals
The engine must:
Execute a routine as an ordered flow of blocks (a “program”).
Render Telegram UI per block (buttons, text, countdown, etc.).
Capture user replies and convert them to structured entries.
Enforce semantic uniqueness (overwrite rules) using semantic_key.
Store all user activity in block_entries.
Support “special blocks” like timers/countdowns and random selection from external_data.
Allow user to run routines via commands and later via scheduled triggers.
Core Concepts
A) Runtime Entities
1) Block Template (blocks)
Defines prompt + input type + options + tags + meta.
2) Routine (routines)
Defines blocks[] in order. Each step can optionally override block fields.
3) Tag Definition (tags_registry)
Defines semantic meaning and uniqueness rules.
4) External Data (external_data)
Tag-indexed datasets like stretches, quotes, break activities.
5) Entry (block_entries)
Atomic “event” produced per block run. This is the event log.
Engine Modules
1) RoutineRunner
Responsibility: run a routine instance for a user, step-by-step.
Inputs
userId
routineId
ctx (Telegraf context)
optional startAtStepIndex
optional params (e.g., sprintLength, totalDuration)
Outputs
A completed routine run summary (optional)
Writes to block_entries
Updates session state
2) BlockRunner
Responsibility: execute a single block step:
resolve configuration
render UI
parse reply
produce entry payload
3) SessionStore
Responsibility: persist conversational state so multi-step flows work.
Required because Telegram is stateless between messages.
State must include:
current routine
current step index
pending block awaiting input
runtime params (session lengths, chosen work type, etc.)
pending timers (if any)
Storage options:
PocketBase sessions collection (recommended)
In-memory + fallback (not recommended for production)
4) SemanticKeyBuilder
Responsibility: compute semantic_key consistently for overwrite rules.
Takes:
tag definition (uniqueness rule)
userId
timestamp / date
routine context (session id, sprint index, etc.)
Returns:
string semantic_key
5) EntryWriter
Responsibility: apply uniqueness rules and write block_entries.
Behavior:
If rule is append → create new record
If overwrite_per_day → upsert by (user, semantic_key)
If overwrite_active → upsert by (user, semantic_key)
If overwrite_per_session → upsert by (user, semantic_key) using session id
Collections Needed for Engine
block_entries (event log)
Required fields:
user relation (PocketBase auth user id)
routine relation (optional)
block relation (optional)
tags json array
value json
meta json
semantic_key text
created datetime (auto)
sessions (runtime state)
Recommended fields:
user relation (unique)
state json
updated datetime
Routine Execution Lifecycle
Step 0 — Entry Points
Command triggers
/morning → run routine routine_morning
/work → run routine routine_work
/break → run routine routine_break
/journal → run routine selector
Button triggers
Inline keyboard callback routes to the engine:
routine:start:routine_morning
block:reply:block_mood:4
nav:next / nav:prev
Step 1 — Start Routine
startRoutine(userId, routineId)
Fetch routine
Resolve blocks array (block refs + overrides)
Create a session.runId (uuid) for this routine run
Store session state:
{ runId, routineId, stepIndex: 0, params: {}, awaiting: null }
Call runNextStep()
Step 2 — Run Next Step
runNextStep(ctx, userId)
Load session state
If stepIndex >= routine.blocks.length → end routine
Resolve step block config:
fetch blocks record if step references blockId
apply step overrides (prompt/options/tags/meta)
Call BlockRunner.render(ctx, blockConfig)
If block requires user input:
set session.awaiting = { blockId, expectedType, replyMode }
stop and wait
If block is “auto” (display/random/timer start):
immediately produce entry (if it logs)
write entry
increment stepIndex
continue to next step
Block Execution Spec
Block Types and Their Behaviors
1) text
Render prompt
Await user message
Save entered text
2) number
Render prompt + buttons or ask for numeric input
Validate numeric constraints (min/max from meta)
Save number
3) select (single)
Render inline buttons for each option
On click, save selected option
4) multi_select
Render toggles + “Done”
Save selected list (array)
5) timer
Two modes:
Mode A: countdown-only (no entry)
Mode B: countdown + logs (creates entry at start/end)
Implementation approach:
When timer starts:
store timer state in session: { endsAt, duration, timerBlockId }
optionally create an entry tagged timer.start
When it ends:
send Telegram message “Time’s up”
optionally create an entry tagged timer.end
engine advances to next step automatically
6) display
No user input
Produces message only (e.g., random quote)
May produce entry (optional, controlled by meta logDisplay=true)
7) habit_delta
Specialized block:
Shows habit name + (+1 / -1) buttons
Creates entry with value { delta: +1 }
Enforce “no negatives” at aggregation time (dashboard), NOT by preventing logs.
Reply Handling
Message Replies
When user sends a message and session.awaiting exists:
Validate type
Convert to value
Produce entry
Write entry
Clear awaiting
Increment stepIndex
Continue
Callback Replies (Buttons)
When user clicks inline keyboard:
Parse callback data:
block:reply:<blockId>:<payload>
Validate session.awaiting block matches
Convert payload to value
Produce entry
Write entry
Advance
Tag Registry Integration
Every block has tags (array). The engine uses the primary tag (first tag) to drive semantics, unless block overrides specify otherwise.
When writing an entry:
For each tag on the block, load tag definition (cached)
Decide:
which tag controls uniqueness (primary)
how to compute semantic_key
Store tags array on the entry regardless
Semantic Key Rules
Supported uniqueness rules (in tags_registry)
append
semantic_key = ${tag}|${runId}|${timestamp} (or empty)
always insert
overwrite_per_day
semantic_key = ${tag}|${YYYY-MM-DD}
overwrite_active
semantic_key = ${tag}|active
overwrite_per_session
semantic_key = ${tag}|${runId}
overwrite_per_sprint
semantic_key = ${tag}|${runId}|sprint:${n}
Important: semantic_key must be deterministic.
External Data Resolution (Tag-Indexed)
Blocks can request external data using either:
meta.external_source_tags: ["stretch.library"]
or implied by tag registry external_source_tags
Fetch Algorithm
getExternalOptions(block, tagsRegistry)
Determine source tags:
prefer block.meta.external_source_tags
else tagRegistry[tag].external_source_tags
Query external_data where tags contains sourceTag AND (optional user ownership)
Merge/resolve options:
if external data returns list → use as options
else fallback to block.options
Random Selection
If block.meta.mode === "random":
pick random option from resolved options
render it
optionally log it as entry (recommended)
Work Mode (Pomodoro Loop) Engine Requirements
Work mode is special because it loops.
Recommended: treat as a routine that can re-enter itself via state.
Work Session State
runId
totalMinutes
sprintMinutes
sprintsCompleted
endsAt
Loop Algorithm
Start sprint timer
On timer end → run reflection block(s)
Run break suggestion block
Run break timer (optional)
Increment sprint count
If now >= endsAt → end routine
Else loop back to sprint timer step
Implementation: allow a block meta nextStepIndex override or a loop object in routine meta.
End Routine
When routine finishes:
Clear session state or mark run completed
Send “routine completed” message
Optionally show quick summary:
entries created count
next recommended routine
Return control to main menu
Performance + Caching
You should cache:
Tag registry (by tag)
Block templates (by id)
Routine definitions (by id)
External data lists (by tag + user scope)
Cache invalidation strategy:
TTL (e.g., 60s–5m) is fine for MVP
Minimal Implementation Checklist (MVP)
Required
executeRoutine()
runNextStep()
renderBlock()
handleMessageReply()
handleCallbackReply()
computeSemanticKey()
writeEntryWithUpsert()
sessionStore.get/set/clear
externalData.resolveOptions()
Optional (but smart)
scheduler for routine triggers (Phase 2)
timer manager for countdown completion messages
entry aggregation helpers for dashboard
Strong Opinionated Recommendations
Store session state in PocketBase, not memory. If the bot restarts, you don’t want users stuck.
Never rely on PocketBase JSON uniqueness. Always enforce overwrite using semantic_key + backend upsert.
Keep code logic in Node, not in PocketBase. PB stores config only.
Make every entry carry tags. Don’t store “tag” as a single string only—use array always.
Treat work mode as a stateful loop, not a static list of blocks.