import { createInsertSchema } from "drizzle-orm/zod";
import type { z } from "zod";
import { networks } from "../../db/schema.js";

export const CreateNetworkSchema = createInsertSchema(networks, {
  name: (schema) => schema.min(1).max(255).describe("The name of the network"),
  description: (schema) =>
    schema.max(255).describe("A description of the network"),
  cidr: (schema) => schema.describe("The IP address range of the network"),
}).omit({ id: true, creatorId: true, keysId: true });

export type CreateNetwork = z.infer<typeof CreateNetworkSchema>;
