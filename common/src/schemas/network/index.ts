import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";
import { networks } from "../../db/schema.js";
import { UserSchema } from "../user/index.js";

export const NetworkSchema = createSelectSchema(networks, {
  id: (schema) => schema.describe("The unique identifier of the network"),
  name: (schema) => schema.min(1).max(255).describe("The name of the network"),
  description: (schema) =>
    schema.max(255).describe("A description of the network"),
  cidr: (schema) => schema.describe("The IP address range of the network"),
  creatorId: (schema) =>
    schema.describe("The unique identifier of the network creator"),
});

export const NetworkRelationsSchema = NetworkSchema.extend({
  creator: UserSchema.nullable().describe(
    "The data of user who created network",
  ),
  devicesCount: z.number(),
});

export type Network = z.infer<typeof NetworkRelationsSchema>;
