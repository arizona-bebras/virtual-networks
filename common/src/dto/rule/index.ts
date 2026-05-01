import { createZodDto } from "nestjs-zod";
import { RuleRelationsSchema } from "../../schemas/rule/index.js";

export class RuleDto extends createZodDto(RuleRelationsSchema) {}
