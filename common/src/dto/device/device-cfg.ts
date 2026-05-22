import { createZodDto } from "nestjs-zod";
import { DeviceCfgSchema } from "../../schemas/device/device-cfg.js";

export class DeviceCfgDto extends createZodDto(DeviceCfgSchema) {}
