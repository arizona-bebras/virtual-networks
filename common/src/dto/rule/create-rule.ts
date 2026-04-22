import { createZodDto } from "nestjs-zod";
import { CreateRuleSchema } from "../../schemas/rule/create-rule.js";

export class CreateRuleDto extends createZodDto(CreateRuleSchema) {}
