import { z } from "zod";
import { DeviceSchema } from "../device/index.js";
import { User } from "../network/network-users.js";
import { RuleSchema } from "../rule/index.js";
import { TagSchema } from "../tag/index.js";
import { UserSchema } from "../user/index.js";

const ActionEnum = z.enum(["create", "update", "delete"]);
const EntitiesUnion = z.discriminatedUnion("id", [
  DeviceSchema,
  RuleSchema,
  TagSchema,
]);

export const EventSchema = z.object({
  id: z.uuid(),
  user: User,
  event: z.string(),
  action: ActionEnum,
  entities: EntitiesUnion,
  time: z.iso.datetime(),
});

export type Event = z.infer<typeof EventSchema>;
