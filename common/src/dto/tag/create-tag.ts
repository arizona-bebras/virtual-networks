import { createZodDto } from "nestjs-zod";
import { CreateTagSchema } from "../../schemas/tag/create-tag.js";

export class CreateTagDto extends createZodDto(CreateTagSchema) {}
