import { z } from "zod";
import { TagSchema } from "../tag/index.js";

export const RuleSchema = z.object({
  id: z.uuid().describe("The unique identifier of the rule"),
  sourceId: z.uuid().describe("The source tag identifier").optional(),
  destId: z.uuid().describe("The destination tag identifier").optional(),
  protocol: z
    .string()
    .min(1)
    .max(32)
    .describe("The network protocol")
    .nullable()
    .optional(),
  port: z
    .number()
    .int()
    .min(0)
    .max(65535)
    .describe("The destination port")
    .nullable()
    .optional(),
});

export const RuleRelationsSchema = RuleSchema.omit({
  sourceId: true,
  destId: true,
}).extend({
  source: TagSchema.extend({
    devicesCount: z
      .number()
      .int()
      .describe("The number of devices with this tag"),
  })
    .nullable()
    .describe("The source tag"),
  dest: TagSchema.extend({
    devicesCount: z
      .number()
      .int()
      .describe("The number of devices with this tag"),
  })
    .nullable()
    .describe("The destination tag"),
});

export type Rule = z.infer<typeof RuleSchema>;
