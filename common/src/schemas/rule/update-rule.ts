import { RuleSchema } from "./index.js";

export const UpdateRuleSchema = RuleSchema.omit({ id: true }).partial();
