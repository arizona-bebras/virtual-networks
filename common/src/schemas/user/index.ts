import { z } from "zod";

export const UserSchema = z.object({
  id: z.uuid().describe("The unique identifier of the user"),
  name: z.string().min(1).max(255).describe("The name of the user"),
  email: z.email().describe("The email address of the user")
});
