import { createZodDto } from "nestjs-zod";
import { DeviceSchema } from "./index.js";

export const UpdateDeviceSchema = DeviceSchema.omit({ id: true }).partial();

export class UpdateDeviceDto extends createZodDto(UpdateDeviceSchema) {}
