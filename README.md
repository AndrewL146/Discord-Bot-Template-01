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
