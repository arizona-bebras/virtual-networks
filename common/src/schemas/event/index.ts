import { z } from "zod";
import { DeviceSchema } from "../device/index.js";
import { NetworkSchema } from "../network/index.js";
import { User } from "../network/network-users.js";
import { RuleSchema } from "../rule/index.js";
import { TagSchema } from "../tag/index.js";

// import { UserSchema } from "../user/index.js";

const ActionEnum = z.union([
  z.object({
    type: z.literal("create"),
  }),
  z.object({
    type: z.literal("update"),
    updatedFields: z.array(
      z.object({ key: z.string(), old: z.string(), new: z.string() }),
    ).optional().nullable(),
  }),
  z.object({
    type: z.literal("delete"),
  }),
]);
const EntitiesUnion = z.union([
  z.object({
    type: z.literal("device"),
    info: DeviceSchema,
  }),
  z.object({
    type: z.literal("rule"),
    info: RuleSchema,
  }),
  z.object({
    type: z.literal("tag"),
    info: TagSchema,
  }),
  z.object({
    type: z.literal("network"),
    info: NetworkSchema,
  }),
]);

export const EventSchema = z.object({
  id: z.uuid(),
  user: User.optional().nullable(),
  action: ActionEnum,
  entity: EntitiesUnion,
  networkId: z.string().nullable().optional(),
  time: z.iso.datetime(),
});

export type Event = z.infer<typeof EventSchema>;
export type EventEntity = z.infer<typeof EntitiesUnion>;
