import "dotenv/config";
import { commandPayload } from "./commands/index.js";
import { syncSlashCommands } from "./lib/command-sync.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  throw new Error("DISCORD_TOKEN and CLIENT_ID are required.");
}

await syncSlashCommands({
  token,
  clientId,
  guildId,
  commands: commandPayload,
  logger: console,
});
