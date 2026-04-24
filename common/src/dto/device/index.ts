import { createZodDto } from "nestjs-zod";
import {
  DeviceRelationsSchema,
  DeviceSchema,
} from "../../schemas/device/index.js";

export class DeviceDto extends createZodDto(DeviceSchema) {}
export class DeviceRelationsDto extends createZodDto(DeviceRelationsSchema) {}
