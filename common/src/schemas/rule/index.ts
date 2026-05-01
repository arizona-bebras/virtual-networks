import { z } from "zod";
import { TagRelationsSchema } from "../tag/index.js";

export const RuleSchema = z.object({
  id: z.uuid().describe("The unique identifier of the rule"),
  sourceId: z.uuid().describe("The source tag identifier").nullable(),
  destId: z.uuid().describe("The destination tag identifier").nullable(),
  protocol: z
    .string()
    .min(1)
    .max(32)
    .describe("The network protocol")
    .nullable(),
  port: z
    .number()
    .int()
    .min(0)
    .max(65535)
    .describe("The destination port")
    .nullable(),
});

export const RuleRelationsSchema = RuleSchema.extend({
  source: TagRelationsSchema.nullable().describe("The source tag"),
  dest: TagRelationsSchema.nullable().describe("The destination tag"),
});

export type Rule = z.infer<typeof RuleSchema>;
