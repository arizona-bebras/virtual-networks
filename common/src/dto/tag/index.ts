import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const TagColorSchema = z.enum([
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
]);

export const TagSchema = z.object({
  id: z.uuid().describe("The unique identifier of the tag"),
  name: z.string().min(1).max(255).describe("The name of the tag"),
  color: TagColorSchema.describe("The display color of the tag"),
});

export class TagDto extends createZodDto(TagSchema) {}
