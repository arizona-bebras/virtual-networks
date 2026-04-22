import { z } from "zod";

export const NetworkEnterCredentialsSchema = z.object({
  key: z.string().min(1).describe("The network access key"),
});
