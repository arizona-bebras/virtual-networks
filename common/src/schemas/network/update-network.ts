import { createUpdateSchema } from "drizzle-orm/zod";
import { z } from "zod";
import { networks } from "../../db/schema.js";

export const UpdateNetworkSchema = createUpdateSchema(networks, {
  name: (schema) => schema.min(1).max(255).describe("The name of the network"),
  description: (schema) =>
    schema.max(255).describe("A description of the network"),
  domain: (schema) =>
    schema
      .min(1)
      .max(32)
      .regex(/^[a-z0-9-]+$/)
      .describe("The domain of the network"),
  cidr: z.cidrv4(),
}).omit({ id: true, creatorId: true, keysId: true });

export type UpdateNetwork = z.infer<typeof UpdateNetworkSchema>;
