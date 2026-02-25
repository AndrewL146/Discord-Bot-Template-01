# Discord Advanced Moderation Bot Pterodactyl Egg

This repository includes a production-oriented Pterodactyl egg for hosting a high-feature Discord moderation bot.

## Included capabilities

- Node.js 20/22 runtime support.
- Optional auto-clone from Git repository on install.
- Dependency install via `npm ci` (or `npm install` fallback).
- Optional startup `git pull` for fast deploy workflows.
- Optional migration execution (`npm run migrate`).
- Common environment variables for modern moderation bots:
  - Discord identity/token settings
  - Owner and guild controls
  - Database + Redis backing services
  - Dashboard toggle and port

## Importing in Pterodactyl

1. Open **Nests** in your Pterodactyl admin panel.
2. Pick an existing nest (or create one), then click **Import Egg**.
3. Upload `egg-discord-advanced-moderation-bot.json`.
4. Create a server using this egg.
5. Set your environment variables, especially `DISCORD_TOKEN`.

## Recommended bot feature stack

To match top-tier moderation bots, pair this egg with a bot codebase that includes:

- Slash commands + context menus
- Auto moderation (spam, profanity, invite filters, caps flood)
- Anti-raid mode + verification levels
- Timed punishments (mute, jail, quarantine)
- Mod logs + case system + appeal workflow
- Ticketing + transcript export
- Reaction roles + onboarding flows
- Audit dashboards + metrics + alerting

The egg is deployment-ready; the actual moderation feature depth comes from your bot implementation.


## Full capability catalog

See `FEATURES.md` for a full end-to-end list of what an advanced moderation bot deployment can do with this egg + a top-tier bot codebase.


## Local database hosting (inside bot files)

This egg now defaults to a local SQLite database file stored in your server files:

- Default `DATABASE_URL`: `sqlite:./data/bot.db`
- The installer/startup creates `./data` automatically.
- This keeps the DB inside the bot server filesystem in Pterodactyl.

If you want Postgres/MySQL later, just replace `DATABASE_URL` with your remote connection string.

## Updating the egg JSON

When you want to change behavior (startup, variables, installer, defaults), update `egg-discord-advanced-moderation-bot.json` directly and re-import it in Pterodactyl.

1. Edit the file in your repo:
   - `startup` for runtime behavior
   - `scripts.installation.script` for install-time behavior
   - `variables[]` for panel environment options
2. Validate JSON before upload:
   - `jq empty egg-discord-advanced-moderation-bot.json`
   - `python -m json.tool egg-discord-advanced-moderation-bot.json >/dev/null`
3. In Pterodactyl admin panel, go to **Nests → Import Egg** and upload the updated JSON.
4. Recreate the server (or update settings) and set environment variables.

### Updating local DB behavior

This egg defaults to local SQLite in server files (`sqlite:./data/bot.db`).

- Keep `DATABASE_URL=sqlite:./data/bot.db` for in-filesystem storage.
- Switch `DATABASE_URL` to Postgres/MySQL URL when moving to an external DB.

