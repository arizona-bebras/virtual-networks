import { z } from "zod";

export const RuleSchema = z.object({
  id: z.uuid().describe("The unique identifier of the rule"),
  source: z.uuid().describe("The source tag identifier").optional(),
  dest: z.uuid().describe("The destination tag identifier").optional(),
  protocol: z
    .string()
    .min(1)
    .max(32)
    .describe("The network protocol")
    .optional(),
  port: z
    .number()
    .int()
    .min(0)
    .max(65535)
    .describe("The destination port")
    .optional(),
});
