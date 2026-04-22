import { createZodDto } from "nestjs-zod";
import { RuleSchema } from "./index.js";

export const CreateRuleSchema = RuleSchema.omit({ id: true });

export class CreateRuleDto extends createZodDto(CreateRuleSchema) {}
