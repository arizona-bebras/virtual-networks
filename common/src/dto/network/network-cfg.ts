import { createZodDto } from "nestjs-zod";
import { NetworkCfgSchema } from "../../schemas/network/network-cfg.js";

export class NetworkCfgDto extends createZodDto(NetworkCfgSchema) {}
