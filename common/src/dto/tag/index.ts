import { createZodDto } from "nestjs-zod";
import { TagSchema } from "../../schemas/tag/index.js";

export class TagDto extends createZodDto(TagSchema) {}
