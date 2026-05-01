import { createZodDto } from "nestjs-zod";
import { NetworkRelationsSchema } from "../../schemas/network/index.js";

export class NetworkDto extends createZodDto(NetworkRelationsSchema) {}
