import type { z } from "zod";
import { DeviceSchema } from "./index.js";

export const CreateDeviceSchema = DeviceSchema.partial({
  ownerId: true,
}).omit({ id: true });

export type CreateDevice = z.infer<typeof CreateDeviceSchema>;
