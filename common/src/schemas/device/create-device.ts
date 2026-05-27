import { createInsertSchema } from "drizzle-orm/zod";
import { z } from "zod";
import { devices } from "../../db/schema.js";

export const CreateDeviceSchema = createInsertSchema(devices, {
  name: (schema) => schema.min(1).max(255).describe("The name of the device"),
  slug: (schema) =>
    schema
      .min(1)
      .max(32)
      .regex(/^[a-z0-9-]+$/)
      .describe("The domain of the device in the network"),
  ip: z.ipv4(),
  ownerId: (schema) => schema.describe("The identifier of the device owner"),
})
  .omit({ id: true, networkId: true, keysId: true })
  .partial({
    ownerId: true,
  });

export type CreateDevice = z.infer<typeof CreateDeviceSchema>;
