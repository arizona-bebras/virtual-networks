import { z } from "zod";
import { RuleSchema } from "./index.js";

export const CreateRuleSchema = RuleSchema.omit({ id: true });

export type CreateRule = z.infer<typeof CreateRuleSchema>;
