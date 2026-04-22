import { z } from "zod";
import { NetworkSchema } from "./index.js";

export const UpdateNetworkSchema = NetworkSchema.omit({ id: true }).partial();

export type UpdateNetwork = z.infer<typeof UpdateNetworkSchema>;
