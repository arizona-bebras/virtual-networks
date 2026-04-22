import { TagSchema } from "./index.js";

export const UpdateTagSchema = TagSchema.omit({ id: true }).partial();
