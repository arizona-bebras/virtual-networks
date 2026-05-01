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
  color: TagColorSchema.nullable().describe("The display color of the tag"),
});

export const TagRelationsSchema = TagSchema.extend({
  devicesCount: z.number().describe("The number of devices with this tag"),
});

export type TagColor = z.infer<typeof TagColorSchema>;
export type Tag = z.infer<typeof TagRelationsSchema>;
