import { RuleSchema } from "./index.js";

export const CreateRuleSchema = RuleSchema.omit({ id: true });
