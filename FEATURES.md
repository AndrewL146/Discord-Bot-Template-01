# Full Capability List: Advanced Discord Moderation Bot (Deployed with this Egg)

This is the **complete practical feature list** your bot setup can support when paired with a modern moderation codebase (Discord.js/Detritus/Eris, etc.) and this egg.

> Important: The egg provides deployment/runtime infrastructure. The bot code you deploy determines which of these features are actually active.

## 1) Core moderation commands

- Warn users (with reason + moderator attribution)
- Kick users
- Ban / softban / tempban
- Timeout / untimeout
- Mute / unmute (role-based or native timeout)
- Nickname moderation and reset
- Message purge / prune with filters (count, user, links, bots)
- Slowmode controls per channel
- Lock/unlock channels
- Role assignment/removal moderation commands
- Bulk action safeguards (confirmation prompts, dry-run previews)

## 2) Case management system

- Per-action case IDs
- Case reason editing
- Case search/filter by user, mod, action, date range
- Case timeline history
- Notes/internal annotations for moderators
- Auto-expiration tracking for temporary punishments
- Appeal status linkage to case IDs

## 3) AutoMod & content filtering

- Anti-spam (message burst, duplicate text, repeated attachments)
- Invite link filtering (allowlist/blocklist)
- URL/domain filtering (phishing and scam-domain deny lists)
- Mention spam protection
- All-caps flood detection
- Profanity/keyword filters with word boundary logic
- Unicode/zalgo abuse detection
- Attachment type restrictions
- NSFW detection hooks (via external classifiers)
- Escalation ladder (warn → timeout → mute → kick/ban)

## 4) Anti-raid & threat protection

- Join-rate detection
- Fresh-account / low-age-account restrictions
- Anti-nuke guardrails for roles/channels/webhooks
- Role-grant anomaly detection
- Emergency lockdown mode
- Verification level escalation during attacks
- Captcha/manual verification workflows
- Alt-account heuristics and risk scoring
- IP/device correlation support (if external auth is used)

## 5) Logging & audit observability

- Mod action logs
- Message delete/edit logs
- Channel/role/permission change logs
- Member join/leave logs
- Voice state logs
- Webhook and integration change logs
- Bot decision logs (why automod took action)
- Exportable incident bundles/transcripts
- Immutable audit trail patterns (append-only storage strategies)

## 6) Ticketing, reports, and appeals

- User report intake (message/user report commands)
- Staff ticket queues by category/severity
- Private ticket channels/threads
- Ticket lifecycle states (open/pending/solved/closed)
- Transcript generation
- Evidence attachment handling
- Punishment appeals workflow with SLA tracking

## 7) Role, onboarding, and community safety flows

- Reaction/self-assign roles
- Join gate screening questionnaire
- Member onboarding prompts
- Probation roles for newcomers
- Channel access tiers by trust level
- Anti-link/anti-media restrictions for new members
- Auto-role by account age/verification state

## 8) Slash command and UX features

- Slash commands + autocomplete
- Context menu moderation actions
- Ephemeral staff responses
- Rich embeds for action feedback
- Interactive confirmation buttons/select menus
- Localization/i18n support
- Permission-aware command visibility

## 9) Staff governance & permissions

- Hierarchical staff role permissions
- Per-command role/user allowlists
- Sensitive command dual-confirmation
- Moderator action cooldowns
- Duty mode / on-call rotation support
- Internal policy templates for reasons/punishments

## 10) Analytics & health monitoring

- Moderation volume metrics
- False-positive automod metrics
- Raid event metrics
- Moderator performance dashboards
- Alerting to Discord/webhook/email endpoints
- Runtime health checks
- Queue/latency monitoring
- Storage and cache performance indicators

## 11) Data & infrastructure capabilities

- Database-backed state (`DATABASE_URL`, default local SQLite file `sqlite:./data/bot.db`)
- Redis-backed caching/rate-limiting (`REDIS_URL`)
- Optional migration execution on startup
- Optional Git pull deployment flow
- Reproducible dependency install (`npm ci`)
- Runtime script switching via `BOT_SCRIPT`
- Dashboard toggle/port support
- Local SQLite storage inside the bot server files (`./data/bot.db`)

## 12) Reliability & operations best practices

- Graceful shutdown handling
- Reconnect/resume logic for Discord gateway events
- Idempotent moderation actions
- Retry strategy for external API calls
- Circuit breaking for unstable dependencies
- Secrets loaded through environment variables
- Structured logging (`LOG_LEVEL` driven)

## 13) Compliance and privacy controls

- Configurable data retention windows
- PII minimization and redaction options
- Moderator-only access to sensitive logs
- Right-to-delete workflows (where policy requires)
- Jurisdiction-aware policy hooks

## 14) Optional “top-tier” extras

- AI-assisted toxicity triage (human-in-the-loop)
- Similarity-based scam message clustering
- Cross-guild threat intel feeds
- Smart trust scoring over time
- Public transparency reports
- Automated policy linting for server settings

---

## What this egg itself directly does (guaranteed)

- Runs your bot on Node.js 20/22 images
- Installs dependencies on install/startup as configured
- Optionally clones/pulls from Git
- Optionally runs migrations
- Exposes env vars for token, IDs, DB, Redis, dashboard and deployment toggles

These are deployment features, not moderation logic by themselves.
