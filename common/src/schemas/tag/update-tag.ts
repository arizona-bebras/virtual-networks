import { z } from "zod";
import { TagSchema } from "./index.js";

export const UpdateTagSchema = TagSchema.omit({ id: true }).partial();

export type UpdateTag = z.infer<typeof UpdateTagSchema>;
