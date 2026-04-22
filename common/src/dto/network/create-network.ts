import { createZodDto } from "nestjs-zod";
import { CreateNetworkSchema } from "../../schemas/network/create-network.js";

export class CreateNetworkDto extends createZodDto(CreateNetworkSchema) {}
