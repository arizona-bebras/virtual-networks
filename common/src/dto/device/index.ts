import { createZodDto } from "nestjs-zod";
import { DeviceSchema } from "../../schemas/device/index.js";

export class DeviceDto extends createZodDto(DeviceSchema) {}
