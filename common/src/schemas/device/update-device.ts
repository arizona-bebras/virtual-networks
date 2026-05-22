import { createUpdateSchema } from "drizzle-orm/zod";
import type { z } from "zod";
import { devices } from "../../db/schema.js";

export const UpdateDeviceSchema = createUpdateSchema(devices, {
  name: (schema) => schema.min(1).max(255).describe("The name of the device"),
  ip: (schema) => schema.describe("The IP address of the device"),
  ownerId: (schema) => schema.describe("The identifier of the device owner"),
}).omit({ id: true, networkId: true, keysId: true });

export type UpdateDevice = z.infer<typeof UpdateDeviceSchema>;
