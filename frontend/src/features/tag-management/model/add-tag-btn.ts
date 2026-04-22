import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(2).max(50),
  color: z.enum(["red", "green", "blue", "yellow", "purple", "orange"]),
});

export type FormSchema = typeof formSchema;
