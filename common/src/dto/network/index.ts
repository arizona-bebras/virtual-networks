import { createZodDto } from "nestjs-zod";
import { NetworkSchema } from "../../schemas/network/index.js";

export class NetworkDto extends createZodDto(NetworkSchema) {}
