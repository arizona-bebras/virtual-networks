import { createZodDto } from "nestjs-zod";
import { DeviceSchema } from "./index.js";

export const CreateDeviceSchema = DeviceSchema.omit({ id: true });

export class CreateDeviceDto extends createZodDto(CreateDeviceSchema) {}
