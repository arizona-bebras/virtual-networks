import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().describe("The unique identifier of the user"),
  name: z.string().describe("The name of the user"),
  email: z.string().describe("The email of the user")
})
