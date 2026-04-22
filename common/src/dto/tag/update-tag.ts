import { createZodDto } from "nestjs-zod";
import { TagSchema } from "./index.js";

export const UpdateTagSchema = TagSchema.omit({ id: true }).partial();

export class UpdateTagDto extends createZodDto(UpdateTagSchema) {}
