import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";
import { colorEnum, tags } from "../../db/schema.js";

export const TagColorSchema = createSelectSchema(colorEnum).nullable();

export const TagSchema = createSelectSchema(tags, {
  id: (schema) => schema.describe("The unique identifier of the tag"),
  name: (schema) => schema.min(1).max(255).describe("The name of the tag"),
  color: (schema) => schema.describe("The display color of the tag"),
}).omit({ networkId: true });

export const TagRelationsSchema = TagSchema.extend({
  devicesCount: z.number().describe("The number of devices with this tag"),
});

export type TagColor = z.infer<typeof TagColorSchema>;
export type Tag = z.infer<typeof TagRelationsSchema>;
