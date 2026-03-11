import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} from "discord.js";
import { JsonStore } from "./lib/storage.js";
import { createLogger } from "./lib/logger.js";
import { evaluateAutomod } from "./lib/automod.js";
import { configCommand, handleConfig } from "./commands/config.js";
import { handleModeration, moderationCommand } from "./commands/moderation.js";
import { logToModChannel, modEmbed } from "./lib/moderation.js";

const logger = createLogger(process.env.LOG_LEVEL || "info");
const store = new JsonStore();
const spamState = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
client.commands.set(moderationCommand.name, { run: handleModeration });
client.commands.set(configCommand.name, { run: handleConfig });

client.on("ready", () => {
  logger.info(`Logged in as ${client.user.tag}`);
  client.user.setActivity("protecting your server", { type: 3 });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.run(interaction, store);
  } catch (error) {
    logger.error(`Command failed: ${interaction.commandName}`, error);
    const reply = { content: "Command failed. Check bot permissions and role hierarchy.", ephemeral: true };
    if (interaction.deferred || interaction.replied) await interaction.followUp(reply).catch(() => null);
    else await interaction.reply(reply).catch(() => null);
  }
});

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;
  const cfg = store.guildConfig(message.guild.id);
  if (!cfg.automod.enabled) return;

  const verdict = evaluateAutomod(message, cfg.automod, spamState);
  if (!verdict) return;

  await message.delete().catch(() => null);

  if (verdict.action === "timeout") {
    const member = await message.guild.members.fetch(message.author.id).catch(() => null);
    await member?.timeout(10 * 60_000, `Automod: ${verdict.reason}`).catch(() => null);
    store.createInfraction({ guildId: message.guild.id, userId: message.author.id, actorId: client.user.id, type: "automod-timeout", reason: verdict.reason });
  } else {
    store.createInfraction({ guildId: message.guild.id, userId: message.author.id, actorId: client.user.id, type: "automod-delete", reason: verdict.reason });
  }

  const warning = await message.channel.send(`${message.author}, your message was removed: **${verdict.reason}**`).catch(() => null);
  setTimeout(() => warning?.delete().catch(() => null), 10_000);

  await logToModChannel(
    message.guild,
    cfg.modLogChannelId,
    modEmbed("Automod action", 0xe74c3c)
      .setDescription(`${message.author} triggered automod`)
      .addFields(
        { name: "Reason", value: verdict.reason },
        { name: "Channel", value: `${message.channel}` },
      ),
  );
});

client.on("guildMemberAdd", async (member) => {
  const cfg = store.guildConfig(member.guild.id);
  if (!cfg.antiRaid.enabled) return;

  const joins = store.joinTick(member.guild.id);
  if (joins < cfg.antiRaid.joinsPerMinuteThreshold) return;

  const embed = modEmbed("Anti-raid threshold reached", 0xff4757)
    .setDescription(`Detected **${joins}** joins in the last minute.`)
    .addFields(
      { name: "Threshold", value: String(cfg.antiRaid.joinsPerMinuteThreshold), inline: true },
      { name: "Server", value: member.guild.name, inline: true },
    );

  await logToModChannel(member.guild, cfg.modLogChannelId, embed);

  if (cfg.antiRaid.autoLockdown) {
    for (const [, channel] of member.guild.channels.cache) {
      if (!channel.isTextBased() || !channel.permissionOverwrites) continue;
      await channel.permissionOverwrites.edit(member.guild.roles.everyone, { SendMessages: false }).catch(() => null);
    }
    await logToModChannel(member.guild, cfg.modLogChannelId, modEmbed("Auto-lockdown activated", 0xc0392b));
  }
});

if (!process.env.DISCORD_TOKEN) {
  logger.fatal("DISCORD_TOKEN is required.");
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
