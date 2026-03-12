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
- `GUILD_ID` (recommended for instant command updates in one server)


### Pterodactyl (no SSH) recommended settings

Set these in your server **Startup / Variables** panel:

- `AUTO_REGISTER_COMMANDS=1`
- `GUILD_ID=<your_server_id>`
- `COMMAND_SYNC_SCOPE=guilds`

With this setup, the bot auto-registers slash commands every startup without needing terminal access.

### 3) (Optional) Register slash commands manually

```bash
node src/register-commands.js
```

> The bot now auto-syncs slash commands on startup by default (`AUTO_REGISTER_COMMANDS=1`).

### 4) Start bot

```bash
npm start
```


## Slash commands not showing?

Use this checklist:

1. **Run guild-scoped sync for instant updates**
   - Set `GUILD_ID` in `.env`, then run:

   ```bash
   node src/register-commands.js
   ```

   Guild commands typically appear in seconds. Global commands can take up to ~1 hour.

2. **Ensure startup auto-sync is enabled**
   - In `.env` (or Pterodactyl Variables) set:

   ```env
   AUTO_REGISTER_COMMANDS=1
   COMMAND_SYNC_SCOPE=guilds
   ```

3. **Re-invite bot with correct scopes**
   - Must include both scopes: `bot` and `applications.commands`.

4. **Confirm IDs and token**
   - `DISCORD_TOKEN` = bot token
   - `CLIENT_ID` = application ID
   - `GUILD_ID` = your test server ID (for fast command propagation)

5. **Restart bot after changes (panel restart is enough)**

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


## Fixing ZIP upload nested-folder issue (Pterodactyl/File Manager)

If you uploaded a ZIP and now all files are inside a subfolder (for example `Discord-Bot-Template-01/`), move them to server root with one command.

### Safe helper script (recommended)

From your server root (`/mnt/server`):

```bash
chmod +x scripts/flatten-zip-upload.sh
./scripts/flatten-zip-upload.sh Discord-Bot-Template-01
```

- The script moves files/folders from the nested directory to the current folder.
- It **does not overwrite existing files** (it skips conflicts).
- It supports hidden files like `.env` and `.gitignore`.

### Manual fallback (no script)

```bash
shopt -s dotglob nullglob
mv Discord-Bot-Template-01/* .
rmdir Discord-Bot-Template-01
```

Then run:

```bash
npm install
npm run check
npm start
```


## Auto-pull updates in Pterodactyl (no SSH)

Your egg already supports automatic git pulls on every startup.

### 1) Configure these Startup/Variables in panel

- `GIT_ADDRESS` = your repository URL (example: `https://github.com/you/your-bot.git`)
- `GIT_BRANCH` = branch to deploy (example: `main`)
- `AUTO_PULL` = `1`
- `FORCE_INSTALL` = `0` (set to `1` only when you changed dependencies)

### 2) Reinstall once (important)

After setting `GIT_ADDRESS` and `GIT_BRANCH`, run **Reinstall** from the panel so the server is cloned as a git repo.

### 3) Normal update flow

- Push changes to your GitHub branch.
- Restart the server from the panel.
- On startup it will run `git pull --rebase` automatically, then start the bot.

### 4) Verify in console logs

Look for:

- `[startup] pulling latest changes`
- `[startup] launching bot`

If you do **not** see the pull log, your server may not have a `.git` repo (run Reinstall once after setting `GIT_ADDRESS`).

## Pterodactyl deployment

Import `egg-discord-advanced-moderation-bot.json` in your panel, then create a server with required env variables.
