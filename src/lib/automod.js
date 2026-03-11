export function evaluateAutomod(message, config, state) {
  const text = message.content || "";
  if (!text.trim()) return null;

  const upper = text.replace(/[^a-zA-Z]/g, "");
  const capsPercent = upper.length ? ((upper.match(/[A-Z]/g) || []).length / upper.length) * 100 : 0;
  if (capsPercent > config.maxCapsPercent && text.length > 8) {
    return { reason: `Excessive caps (${Math.round(capsPercent)}%)`, action: "delete_warn" };
  }

  if (!config.allowInvites && /(discord\.gg|discord\.com\/invite)\//i.test(text)) {
    return { reason: "Invite links are blocked", action: "delete_warn" };
  }

  const lowered = text.toLowerCase();
  const blocked = (config.blockedWords || []).find((w) => lowered.includes(w.toLowerCase()));
  if (blocked) {
    return { reason: `Blocked phrase detected: ${blocked}`, action: "delete_warn" };
  }

  if ((message.mentions?.users?.size ?? 0) > config.maxMentions) {
    return { reason: `Too many mentions (> ${config.maxMentions})`, action: "delete_warn" };
  }

  const now = Date.now();
  const userState = state.get(message.author.id) || [];
  const pruned = userState.filter((ts) => now - ts < config.spamWindowMs);
  pruned.push(now);
  state.set(message.author.id, pruned);
  if (pruned.length >= config.spamMessageThreshold) {
    return { reason: "Spam burst detected", action: "timeout" };
  }

  return null;
}
