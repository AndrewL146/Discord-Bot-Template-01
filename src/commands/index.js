import { configCommand } from "./config.js";
import { moderationCommand } from "./moderation.js";

export const commandBuilders = [moderationCommand, configCommand];
export const commandPayload = commandBuilders.map((c) => c.toJSON());
