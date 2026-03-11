import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export const configCommand = new SlashCommandBuilder()
  .setName("config")
  .setDescription("Server moderation configuration")
  .addSubcommand((s) => s
    .setName("set-modlog")
    .setDescription("Set moderation log channel")
    .addChannelOption((o) => o.setName("channel").setDescription("Log channel").setRequired(true)))
  .addSubcommand((s) => s
    .setName("automod")
    .setDescription("Toggle automod on/off")
    .addBooleanOption((o) => o.setName("enabled").setDescription("Enable automod").setRequired(true)))
  .addSubcommand((s) => s
    .setName("anti-raid")
    .setDescription("Configure anti-raid joins threshold")
    .addBooleanOption((o) => o.setName("enabled").setDescription("Enable anti-raid").setRequired(true))
    .addIntegerOption((o) => o.setName("joins-per-minute").setDescription("Join threshold").setMinValue(3).setMaxValue(100).setRequired(true)))
  .addSubcommand((s) => s
    .setName("blocked-word")
    .setDescription("Add/remove blocked words")
    .addStringOption((o) => o.setName("action").setDescription("add/remove").addChoices({ name: "add", value: "add" }, { name: "remove", value: "remove" }).setRequired(true))
    .addStringOption((o) => o.setName("word").setDescription("Word/phrase").setRequired(true)))
  .addSubcommand((s) => s.setName("show").setDescription("Show active moderation config"))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function handleConfig(interaction, store) {
  const sub = interaction.options.getSubcommand();
  const cfg = store.guildConfig(interaction.guild.id);

  if (sub === "set-modlog") {
    const channel = interaction.options.getChannel("channel", true);
    cfg.modLogChannelId = channel.id;
    store.save();
    return interaction.reply(`Mod logs will be sent to ${channel}.`);
  }

  if (sub === "automod") {
    cfg.automod.enabled = interaction.options.getBoolean("enabled", true);
    store.save();
    return interaction.reply(`Automod is now **${cfg.automod.enabled ? "enabled" : "disabled"}**.`);
  }

  if (sub === "anti-raid") {
    cfg.antiRaid.enabled = interaction.options.getBoolean("enabled", true);
    cfg.antiRaid.joinsPerMinuteThreshold = interaction.options.getInteger("joins-per-minute", true);
    store.save();
    return interaction.reply(`Anti-raid updated: enabled=${cfg.antiRaid.enabled}, threshold=${cfg.antiRaid.joinsPerMinuteThreshold}/min.`);
  }

  if (sub === "blocked-word") {
    const action = interaction.options.getString("action", true);
    const word = interaction.options.getString("word", true).trim();
    if (!word) return interaction.reply({ content: "Word cannot be empty.", ephemeral: true });
    if (action === "add") {
      if (!cfg.automod.blockedWords.includes(word)) cfg.automod.blockedWords.push(word);
      store.save();
      return interaction.reply(`Added blocked phrase: **${word}**`);
    }
    cfg.automod.blockedWords = cfg.automod.blockedWords.filter((w) => w.toLowerCase() !== word.toLowerCase());
    store.save();
    return interaction.reply(`Removed blocked phrase: **${word}**`);
  }

  return interaction.reply({
    content: [
      `**Mod log:** ${cfg.modLogChannelId ? `<#${cfg.modLogChannelId}>` : "Not set"}`,
      `**Automod:** ${cfg.automod.enabled ? "Enabled" : "Disabled"}`,
      `**Caps limit:** ${cfg.automod.maxCapsPercent}%`,
      `**Max mentions:** ${cfg.automod.maxMentions}`,
      `**Invite filter:** ${cfg.automod.allowInvites ? "Allowed" : "Blocked"}`,
      `**Blocked words:** ${cfg.automod.blockedWords.join(", ") || "None"}`,
      `**Anti-raid:** ${cfg.antiRaid.enabled ? "Enabled" : "Disabled"} (${cfg.antiRaid.joinsPerMinuteThreshold}/min)`,
    ].join("\n"),
    ephemeral: true,
  });
}
