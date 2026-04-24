import { createZodDto } from "nestjs-zod";
import { UpdateTagSchema } from "../../schemas/tag/update-tag.js";

export class UpdateTagDto extends createZodDto(UpdateTagSchema) {}
