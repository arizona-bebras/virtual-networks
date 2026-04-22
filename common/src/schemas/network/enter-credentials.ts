import { z } from "zod";

export const NetworkEnterCredentialsSchema = z.object({
  key: z.string().min(1).describe("The network access key"),
});

export type NetworkEnterCredentials = z.infer<
  typeof NetworkEnterCredentialsSchema
>;
