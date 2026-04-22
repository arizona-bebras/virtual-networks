import { createZodDto } from "nestjs-zod";
import { TagSchema } from "./index.js";

export const CreateTagSchema = TagSchema.omit({ id: true });

export class CreateTagDto extends createZodDto(CreateTagSchema) {}
