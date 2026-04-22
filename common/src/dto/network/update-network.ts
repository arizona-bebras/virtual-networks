import { createZodDto } from "nestjs-zod";
import { UpdateNetworkSchema } from "../../schemas/network/update-network.js";

export class UpdateNetworkDto extends createZodDto(UpdateNetworkSchema) {}
