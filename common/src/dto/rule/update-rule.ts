import { createZodDto } from "nestjs-zod";
import { UpdateRuleSchema } from "../../schemas/rule/update-rule.js";

export class UpdateRuleDto extends createZodDto(UpdateRuleSchema) {}
