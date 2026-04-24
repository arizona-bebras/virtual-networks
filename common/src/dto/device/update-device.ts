import { createZodDto } from "nestjs-zod";
import { UpdateDeviceSchema } from "../../schemas/device/update-device.js";

export class UpdateDeviceDto extends createZodDto(UpdateDeviceSchema) {}
