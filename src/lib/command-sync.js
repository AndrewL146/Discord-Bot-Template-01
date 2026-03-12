import { REST, Routes } from "discord.js";

export async function syncSlashCommands({ token, clientId, guildId, commands, logger }) {
  if (!token || !clientId) {
    logger?.warn("Skipping manual REST sync: DISCORD_TOKEN or CLIENT_ID missing.");
    return { skipped: true };
  }

  const rest = new REST({ version: "10" }).setToken(token);

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    logger?.info(`Slash commands synced to guild ${guildId} (${commands.length} commands).`);
    return { scope: "guild", count: commands.length };
  }

  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  logger?.info(`Global slash commands synced (${commands.length} commands).`);
  return { scope: "global", count: commands.length };
}

export async function syncSlashCommandsFromClient({ client, commands, guildId, scope = "guilds", logger }) {
  if (!client?.application) {
    logger?.warn("Skipping startup sync: client application is not ready yet.");
    return { skipped: true };
  }

  if (guildId) {
    await client.application.commands.set(commands, guildId);
    logger?.info(`Startup slash sync complete for guild ${guildId} (${commands.length} commands).`);
    return { scope: "guild", count: commands.length };
  }

  if (scope === "global") {
    await client.application.commands.set(commands);
    logger?.info(`Startup global slash sync complete (${commands.length} commands). Propagation can take up to 1 hour.`);
    return { scope: "global", count: commands.length };
  }

  const guildIds = [...client.guilds.cache.keys()];
  for (const id of guildIds) {
    await client.application.commands.set(commands, id);
  }
  logger?.info(`Startup guild slash sync complete for ${guildIds.length} guild(s) (${commands.length} commands each).`);
  return { scope: "guilds", guildCount: guildIds.length, count: commands.length };
}
