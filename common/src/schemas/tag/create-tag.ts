import { createInsertSchema } from "drizzle-orm/zod";
import type { z } from "zod";
import { tags } from "../../db/schema.js";

export const CreateTagSchema = createInsertSchema(tags, {
  name: (schema) => schema.min(1).max(255).describe("The name of the tag"),
  color: (schema) => schema.describe("The display color of the tag"),
}).omit({ id: true, networkId: true });

export type CreateTag = z.infer<typeof CreateTagSchema>;
