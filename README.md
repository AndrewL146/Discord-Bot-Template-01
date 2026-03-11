# Discord Advanced Moderation Bot (Competitive Template)

This repository now includes:

1. **A production-ready moderation bot codebase** (`src/`) with advanced moderation and automod features.
2. **A Pterodactyl egg** (`egg-discord-advanced-moderation-bot.json`) to deploy it at scale.

## Feature set (top moderation bot style)

- Slash-command based moderation toolkit:
  - `/mod ban`, `/mod kick`, `/mod timeout`, `/mod warn`
  - `/mod purge`, `/mod slowmode`, `/mod lock`, `/mod unlock`
  - `/mod case` and `/mod infractions` for case tracking
- Server configuration command suite:
  - `/config set-modlog`
  - `/config automod`
  - `/config anti-raid`
  - `/config blocked-word`
  - `/config show`
- Automod engine:
  - Caps flood detection
  - Invite link filtering
  - Blocked phrase detection
  - Mention spam detection
  - Message burst detection with timeout escalation
- Anti-raid burst protection:
  - Joins-per-minute tracking
  - Threshold alerting to mod logs
  - Optional auto-lockdown framework
- Persistent moderation case store in `data/moderation.json`

## Quick start

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

```bash
cp .env.example .env
```

Set at minimum:

- `DISCORD_TOKEN`
- `CLIENT_ID`
- `GUILD_ID` (optional for guild-only command registration)

### 3) Register slash commands

```bash
node src/register-commands.js
```

### 4) Start bot

```bash
npm start
```

## Architecture

- `src/index.js`: Bot bootstrap + events (messages, joins, interactions)
- `src/commands/moderation.js`: Full moderation command handlers
- `src/commands/config.js`: Runtime moderation config commands
- `src/lib/automod.js`: Content/rate based automod evaluator
- `src/lib/storage.js`: JSON-backed persistent infractions and guild config
- `src/lib/moderation.js`: Helpers for embeds/logging/permission checks

## Production notes

- Run with Node.js 20+.
- Enable privileged intents in the Discord Developer Portal:
  - **MESSAGE CONTENT INTENT**
  - **SERVER MEMBERS INTENT**
- Make sure bot role is above moderated roles.
- Use a dedicated private moderation log channel.
- For horizontal scaling, migrate `JsonStore` to a real DB and Redis.

## Pterodactyl deployment

Import `egg-discord-advanced-moderation-bot.json` in your panel, then create a server with required env variables.
