import { createSelectSchema } from "drizzle-orm/zod";
import { user } from "../../db/schema.js";

export const UserSchema = createSelectSchema(user, {
  id: (schema) => schema.describe("The unique identifier of the user"),
  name: (schema) => schema.describe("The name of the user"),
  email: (schema) => schema.describe("The email of the user"),
}).pick({
  id: true,
  name: true,
  email: true,
});
