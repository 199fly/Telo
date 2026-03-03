# Changelog

## [Unreleased]
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
