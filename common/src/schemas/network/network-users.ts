import { z } from "zod";
import { UserSchema } from "../user/index.js";

export const RolesEnum = z.enum(["user", "admin"]).nullable();
export const User = UserSchema.extend({
  role: RolesEnum.describe("A role of the user"),
});

export const NetworkUsersSchema = z.object({
  users: z.array(User).describe("The users of the network"),
});

export type NetworkUser = z.infer<typeof NetworkUsersSchema>["users"][number];
