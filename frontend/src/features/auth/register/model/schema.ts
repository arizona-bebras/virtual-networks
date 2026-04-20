import { z } from "zod";

export const formSchema = z.object({
  username: z.string().min(3).max(32),
  mail: z.email(),
  password: z.string().min(8).max(64),
});

export type FormSchema = typeof formSchema;
