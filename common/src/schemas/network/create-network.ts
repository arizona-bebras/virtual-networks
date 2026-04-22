import { NetworkSchema } from "./index.js";

export const CreateNetworkSchema = NetworkSchema.omit({ id: true });
