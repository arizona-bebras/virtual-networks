import type { z } from "zod";
import { TagSchema } from "./index.js";

export const CreateTagSchema = TagSchema.omit({ id: true });

export type CreateTag = z.infer<typeof CreateTagSchema>;
