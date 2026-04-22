import { z } from "zod";
import { DeviceSchema } from "./index.js";

export const UpdateDeviceSchema = DeviceSchema.omit({ id: true }).partial();

export type UpdateDevice = z.infer<typeof UpdateDeviceSchema>;
