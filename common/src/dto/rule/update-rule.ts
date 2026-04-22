import { createZodDto } from "nestjs-zod";
import { RuleSchema } from "./index.js";

export const UpdateRuleSchema = RuleSchema.omit({ id: true }).partial();

export class UpdateRuleDto extends createZodDto(UpdateRuleSchema) {}
