import fs from "node:fs";
import path from "node:path";

const DEFAULT_DATA = {
  guilds: {},
  infractions: [],
  antiRaid: {},
};

export class JsonStore {
  constructor(filePath = "data/moderation.json") {
    this.filePath = filePath;
    this.data = structuredClone(DEFAULT_DATA);
    this.ensure();
  }

  ensure() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(DEFAULT_DATA, null, 2));
      this.data = structuredClone(DEFAULT_DATA);
      return;
    }
    this.data = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
  }

  save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  guildConfig(guildId) {
    if (!this.data.guilds[guildId]) {
      this.data.guilds[guildId] = {
        modLogChannelId: null,
        reportChannelId: null,
        verifiedRoleId: null,
        quarantineRoleId: null,
        automod: {
          enabled: true,
          maxCapsPercent: 70,
          blockedWords: ["nuke", "raid", "token leak"],
          maxMentions: 5,
          allowInvites: false,
          spamWindowMs: 8000,
          spamMessageThreshold: 6,
        },
        antiRaid: {
          enabled: true,
          joinsPerMinuteThreshold: 12,
          autoLockdown: false,
        },
      };
      this.save();
    }
    return this.data.guilds[guildId];
  }

  createInfraction(payload) {
    const id = this.data.infractions.length + 1;
    const record = { id, createdAt: Date.now(), active: true, ...payload };
    this.data.infractions.push(record);
    this.save();
    return record;
  }

  infractionsFor(guildId, userId) {
    return this.data.infractions.filter((i) => i.guildId === guildId && i.userId === userId);
  }

  caseById(guildId, caseId) {
    return this.data.infractions.find((i) => i.guildId === guildId && i.id === caseId);
  }

  joinTick(guildId) {
    const now = Date.now();
    const arr = this.data.antiRaid[guildId] ?? [];
    const pruned = arr.filter((t) => now - t < 60_000);
    pruned.push(now);
    this.data.antiRaid[guildId] = pruned;
    this.save();
    return pruned.length;
  }
}
