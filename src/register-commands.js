import "dotenv/config";
import { REST, Routes } from "discord.js";
import { moderationCommand } from "./commands/moderation.js";
import { configCommand } from "./commands/config.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  throw new Error("DISCORD_TOKEN and CLIENT_ID are required.");
}

const commands = [moderationCommand.toJSON(), configCommand.toJSON()];
const rest = new REST({ version: "10" }).setToken(token);

if (guildId) {
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
  console.log(`Registered ${commands.length} guild commands for ${guildId}.`);
} else {
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log(`Registered ${commands.length} global commands.`);
}
