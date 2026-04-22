import type { z } from "zod";
import { RuleSchema } from "./index.js";

export const UpdateRuleSchema = RuleSchema.omit({ id: true }).partial();

export type UpdateRule = z.infer<typeof UpdateRuleSchema>;
