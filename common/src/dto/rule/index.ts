import { createZodDto } from "nestjs-zod";
import { RuleSchema } from "../../schemas/rule/index.js";

export class RuleDto extends createZodDto(RuleSchema) {}
