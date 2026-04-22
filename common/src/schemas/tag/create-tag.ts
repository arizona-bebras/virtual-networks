import { TagSchema } from "./index.js";

export const CreateTagSchema = TagSchema.omit({ id: true });
