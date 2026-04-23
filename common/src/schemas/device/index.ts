import { z } from "zod";
import { TagSchema } from "../tag/index.js";

export const DeviceSchema = z.object({
  id: z.uuid().describe("The unique identifier of the device"),
  name: z.string().min(1).max(255).describe("The name of the device"),
  ip: z.ipv4().describe("The IP address of the device"),
  ownerId: z.string().describe("The identifier of the device owner"),
});

export const DeviceRelationsSchema = DeviceSchema.extend({
  tags: z
    .array(TagSchema)
    .describe("The list of tags associated with the device"),
});

export type Device = z.infer<typeof DeviceSchema>;
export type DeviceRelations = z.infer<typeof DeviceRelationsSchema>;
