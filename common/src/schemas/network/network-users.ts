import { z } from "zod";
import { UserSchema } from "../user/index.js";

export const RolesEnum = z.enum(["user", "admin"]).nullable();

export const NetworkUsersSchema = z.object({
  users: z
    .array(
      UserSchema.extend({
        role: RolesEnum.describe("A role of the user"),
      }),
    )
    .describe("The users of the network"),
});

export type NetworkUser = z.infer<typeof NetworkUsersSchema>["users"][number];
