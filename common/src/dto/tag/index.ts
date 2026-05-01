import { createZodDto } from "nestjs-zod";
import { TagRelationsSchema } from "../../schemas/tag/index.js";

export class TagDto extends createZodDto(TagRelationsSchema) {}
