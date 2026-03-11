import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { hasModPerms, logToModChannel, modEmbed } from "../lib/moderation.js";

export const moderationCommand = new SlashCommandBuilder()
  .setName("mod")
  .setDescription("Advanced moderation controls")
  .addSubcommand((s) => s
    .setName("ban")
    .setDescription("Ban a member")
    .addUserOption((o) => o.setName("user").setDescription("Target user").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(false)))
  .addSubcommand((s) => s
    .setName("kick")
    .setDescription("Kick a member")
    .addUserOption((o) => o.setName("user").setDescription("Target user").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(false)))
  .addSubcommand((s) => s
    .setName("timeout")
    .setDescription("Timeout a member")
    .addUserOption((o) => o.setName("user").setDescription("Target user").setRequired(true))
    .addIntegerOption((o) => o.setName("minutes").setDescription("Timeout minutes (1-40320)").setMinValue(1).setMaxValue(40320).setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(false)))
  .addSubcommand((s) => s
    .setName("warn")
    .setDescription("Issue a warning")
    .addUserOption((o) => o.setName("user").setDescription("Target user").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(true)))
  .addSubcommand((s) => s
    .setName("purge")
    .setDescription("Bulk-delete messages")
    .addIntegerOption((o) => o.setName("amount").setDescription("2-100").setMinValue(2).setMaxValue(100).setRequired(true)))
  .addSubcommand((s) => s
    .setName("slowmode")
    .setDescription("Set current channel slowmode")
    .addIntegerOption((o) => o.setName("seconds").setDescription("0-21600").setMinValue(0).setMaxValue(21600).setRequired(true)))
  .addSubcommand((s) => s
    .setName("lock")
    .setDescription("Lock a text channel")
    .addChannelOption((o) => o.setName("channel").setDescription("Channel to lock").addChannelTypes(ChannelType.GuildText).setRequired(false)))
  .addSubcommand((s) => s
    .setName("unlock")
    .setDescription("Unlock a text channel")
    .addChannelOption((o) => o.setName("channel").setDescription("Channel to unlock").addChannelTypes(ChannelType.GuildText).setRequired(false)))
  .addSubcommand((s) => s
    .setName("infractions")
    .setDescription("View infractions for a user")
    .addUserOption((o) => o.setName("user").setDescription("Target user").setRequired(true)))
  .addSubcommand((s) => s
    .setName("case")
    .setDescription("View case details")
    .addIntegerOption((o) => o.setName("id").setDescription("Case ID").setRequired(true)))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function handleModeration(interaction, store) {
  if (!hasModPerms(interaction.member)) {
    await interaction.reply({ content: "You need moderation permissions.", ephemeral: true });
    return;
  }

  const guild = interaction.guild;
  const cfg = store.guildConfig(guild.id);
  const sub = interaction.options.getSubcommand();

  if (sub === "warn") {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    const inf = store.createInfraction({ guildId: guild.id, userId: user.id, actorId: interaction.user.id, type: "warn", reason });
    const embed = modEmbed(`Warning issued (#${inf.id})`, 0xf1c40f)
      .setDescription(`${user} warned by ${interaction.user}`)
      .addFields({ name: "Reason", value: reason });
    await interaction.reply({ embeds: [embed] });
    await logToModChannel(guild, cfg.modLogChannelId, embed);
    return;
  }

  if (sub === "infractions") {
    const user = interaction.options.getUser("user", true);
    const rows = store.infractionsFor(guild.id, user.id).slice(-10).reverse();
    const body = rows.length
      ? rows.map((r) => `#${r.id} **${r.type}** • ${new Date(r.createdAt).toLocaleString()} • ${r.reason}`).join("\n")
      : "No infractions found.";
    await interaction.reply({ embeds: [modEmbed(`Infractions: ${user.tag}`).setDescription(body)] });
    return;
  }

  if (sub === "case") {
    const id = interaction.options.getInteger("id", true);
    const row = store.caseById(guild.id, id);
    if (!row) return interaction.reply({ content: "Case not found.", ephemeral: true });
    const embed = modEmbed(`Case #${row.id}`, 0x95a5a6)
      .addFields(
        { name: "Type", value: row.type, inline: true },
        { name: "Target", value: `<@${row.userId}>`, inline: true },
        { name: "Moderator", value: `<@${row.actorId}>`, inline: true },
        { name: "Reason", value: row.reason || "No reason provided" },
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (sub === "purge") {
    const amount = interaction.options.getInteger("amount", true);
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: `Deleted ${deleted.size} messages.`, ephemeral: true });
    return;
  }

  if (sub === "slowmode") {
    const seconds = interaction.options.getInteger("seconds", true);
    await interaction.channel.setRateLimitPerUser(seconds);
    await interaction.reply({ content: `Slowmode set to ${seconds}s in ${interaction.channel}.` });
    return;
  }

  if (sub === "lock" || sub === "unlock") {
    const channel = interaction.options.getChannel("channel") || interaction.channel;
    const overwrite = {
      SendMessages: sub === "unlock",
    };
    await channel.permissionOverwrites.edit(guild.roles.everyone, overwrite);
    await interaction.reply({ content: `${sub === "lock" ? "Locked" : "Unlocked"} ${channel}.` });
    return;
  }

  const target = interaction.options.getMember("user");
  const reason = interaction.options.getString("reason") || "No reason provided";
  if (!target) return interaction.reply({ content: "User is not in this server.", ephemeral: true });

  if (sub === "kick") {
    await target.kick(reason);
    const inf = store.createInfraction({ guildId: guild.id, userId: target.id, actorId: interaction.user.id, type: "kick", reason });
    const embed = modEmbed(`Member kicked (#${inf.id})`, 0xe67e22)
      .setDescription(`${target.user.tag} was kicked.`)
      .addFields({ name: "Reason", value: reason });
    await interaction.reply({ embeds: [embed] });
    await logToModChannel(guild, cfg.modLogChannelId, embed);
    return;
  }

  if (sub === "ban") {
    await target.ban({ reason });
    const inf = store.createInfraction({ guildId: guild.id, userId: target.id, actorId: interaction.user.id, type: "ban", reason });
    const embed = modEmbed(`Member banned (#${inf.id})`, 0xc0392b)
      .setDescription(`${target.user.tag} was banned.`)
      .addFields({ name: "Reason", value: reason });
    await interaction.reply({ embeds: [embed] });
    await logToModChannel(guild, cfg.modLogChannelId, embed);
    return;
  }

  if (sub === "timeout") {
    const minutes = interaction.options.getInteger("minutes", true);
    await target.timeout(minutes * 60_000, reason);
    const inf = store.createInfraction({ guildId: guild.id, userId: target.id, actorId: interaction.user.id, type: "timeout", reason: `${reason} (${minutes}m)` });
    const embed = modEmbed(`Member timed out (#${inf.id})`, 0x9b59b6)
      .setDescription(`${target.user.tag} timed out for ${minutes} minutes.`)
      .addFields({ name: "Reason", value: reason });
    await interaction.reply({ embeds: [embed] });
    await logToModChannel(guild, cfg.modLogChannelId, embed);
  }
}
