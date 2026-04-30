import { z } from "zod";
import { UserSchema } from "../user/index.js";

export const NetworkSchema = z.object({
  id: z.uuid().describe("The unique identifier of the network"),
  name: z.string().min(1).max(255).describe("The name of the network"),
  description: z.string().max(255).describe("A description of the network"),
  cidr: z.cidrv4().describe("The IP address range of the network"),
});

export const NetworkRelationsSchema = NetworkSchema.extend({
  admin: UserSchema.describe("The user who administers the network"),
})

export type Network = z.infer<typeof NetworkSchema>;
