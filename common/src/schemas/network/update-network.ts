import { NetworkSchema } from "./index.js";

export const UpdateNetworkSchema = NetworkSchema.omit({ id: true }).partial();
