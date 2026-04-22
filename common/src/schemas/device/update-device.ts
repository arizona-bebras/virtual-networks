import { DeviceSchema } from "./index.js";

export const UpdateDeviceSchema = DeviceSchema.omit({ id: true }).partial();
