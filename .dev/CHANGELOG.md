# Changelog

## [Unreleased]
- Initial setup of agents files and updated documentation.
- Added PocketBase schema and connection utility.
- Implemented `/start` onboarding flow with PocketBase user storage.
- Added simple journaling workflow and stored user profile fields.
- Enhanced onboarding to ask for first name, username, goal and optional
  favourite quotes.
- Fixed onboarding flow freeze when entering a quote by sending a new
  message with ForceReply.
- Restructured project under `telo/` directory with engine and bot modules.
- Added routine runner with `/run` command and counter input.
- Introduced `logs` collection in schema for generic logging.
