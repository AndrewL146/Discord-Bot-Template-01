import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

export function modEmbed(title, color = 0x5865f2) {
  return new EmbedBuilder().setTitle(title).setColor(color).setTimestamp();
}

export async function logToModChannel(guild, channelId, embed) {
  if (!channelId) return;
  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isTextBased()) return;
  await channel.send({ embeds: [embed] }).catch(() => null);
}

export function hasModPerms(member) {
  if (!member) return false;
  return member.permissions.has(PermissionFlagsBits.ModerateMembers)
    || member.permissions.has(PermissionFlagsBits.KickMembers)
    || member.permissions.has(PermissionFlagsBits.BanMembers)
    || member.permissions.has(PermissionFlagsBits.ManageMessages);
}
