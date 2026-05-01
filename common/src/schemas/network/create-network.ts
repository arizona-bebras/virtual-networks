import type { z } from "zod";
import { NetworkSchema } from "./index.js";

export const CreateNetworkSchema = NetworkSchema.omit({
  id: true,
  creatorId: true,
});

export type CreateNetwork = z.infer<typeof CreateNetworkSchema>;
