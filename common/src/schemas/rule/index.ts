import { createSelectSchema } from "drizzle-orm/zod";
import type { z } from "zod";
import { protocolEnum, rules } from "../../db/schema.js";
import { TagRelationsSchema } from "../tag/index.js";

export const ProtocolSchema = createSelectSchema(protocolEnum);

export const RuleSchema = createSelectSchema(rules, {
  id: (schema) => schema.describe("The unique identifier of the rule"),
  sourceId: (schema) => schema.describe("The source tag identifier"),
  destId: (schema) => schema.describe("The destination tag identifier"),
  description: (schema) =>
    schema.max(255).describe("A description of the rule"),
  protocol: (schema) => schema.describe("The network protocol"),
  port: (schema) =>
    schema.int().min(0).max(65535).describe("The destination port"),
}).omit({ networkId: true });

export const RuleRelationsSchema = RuleSchema.extend({
  source: TagRelationsSchema.nullable().describe("The source tag"),
  dest: TagRelationsSchema.nullable().describe("The destination tag"),
});

export type Rule = z.infer<typeof RuleSchema>;
export type RuleRelation = z.infer<typeof RuleRelationsSchema>;
