import { DeviceSchema } from "./index.js";

export const CreateDeviceSchema = DeviceSchema.omit({ id: true });
