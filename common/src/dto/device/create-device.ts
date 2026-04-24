import { createZodDto } from "nestjs-zod";
import { CreateDeviceSchema } from "../../schemas/device/create-device.js";

export class CreateDeviceDto extends createZodDto(CreateDeviceSchema) {}
