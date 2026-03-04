# Changelog

## [Unreleased]
- Added new routine modes: Focus Mode, Break Reset, and Habit Check-In with tagged block entry writes.
- Expanded onboarding to capture preferred focus duration and tracked habits, and wired these into routine personalization.
- Extended Telegram menu/commands to expose all modes and documented the new flows in README.
- Fixed PocketBase bootstrap by switching schema imports to `fields` format and renaming the profile collection to `profiles`.
- Updated bot code to use the `profiles` collection and added admin auth guards before writes.
- Hardened `start.sh` with env loading, health checks, and existing-port detection.
- Refactored journaling to run as a structured `daily_checkin` routine with reusable blocks.
- Replaced `journal_entries` writes with unified `block_entries` writes keyed by semantic tags.
- Updated menu and quote interactions to match routine-driven behavior.
- Updated `.dev/schema.json` to reflect architecture with `block_entries`, `tags_registry`, and `external_data` collections.
- Added routine orchestration module in `workflows/routines.js`.
- Added Nixpacks deployment with PocketBase setup script.
- Initial setup of agents files and updated documentation.
- Added PocketBase schema and connection utility.
- Implemented `/start` onboarding flow with PocketBase user storage.
- Enhanced onboarding to ask for first name, username, goal and optional
  favourite quotes.
- Fixed onboarding flow freeze when entering a quote by sending a new
  message with ForceReply.
- Improved `initPocketBase.js` to use the PocketBase CLI for admin creation
  when authentication fails.
