import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";
import { devices } from "../../db/schema.js";
import { TagSchema } from "../tag/index.js";
import { UserSchema } from "../user/index.js";

export const DeviceSchema = createSelectSchema(devices, {
  id: (schema) => schema.describe("The unique identifier of the device"),
  name: (schema) => schema.min(1).max(255).describe("The name of the device"),
  ip: (schema) => schema.describe("The IP address of the device"),
  ownerId: (schema) => schema.describe("The identifier of the device owner"),
}).omit({ networkId: true });

export const DeviceRelationsSchema = DeviceSchema.extend({
  tags: z
    .array(TagSchema)
    .describe("The list of tags associated with the device"),
  owner: UserSchema.nullable().describe("The owner of the device"),
});

export type Device = z.infer<typeof DeviceSchema>;
export type DeviceRelations = z.infer<typeof DeviceRelationsSchema>;
