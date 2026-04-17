import { z } from "zod";

export const formSchema = z.object({
  mail: z.email(),
  password: z.string().min(8).max(64),
});

export type FormSchema = typeof formSchema;
