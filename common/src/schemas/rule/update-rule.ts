import { createUpdateSchema } from "drizzle-orm/zod";
import type { z } from "zod";
import { rules } from "../../db/schema.js";

export const UpdateRuleSchema = createUpdateSchema(rules, {
  sourceId: (schema) => schema.describe("The source tag identifier"),
  destId: (schema) => schema.describe("The destination tag identifier"),
  description: (schema) =>
    schema.max(255).describe("A description of the rule"),
  protocol: (schema) => schema.describe("The network protocol"),
  port: (schema) =>
    schema.int().min(0).max(65535).describe("The destination port"),
}).omit({ id: true, networkId: true });

export type UpdateRule = z.infer<typeof UpdateRuleSchema>;
