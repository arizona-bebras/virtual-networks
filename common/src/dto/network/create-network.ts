import { createZodDto } from "nestjs-zod";
import { NetworkSchema } from "./index.js";

export const CreateNetworkSchema = NetworkSchema.omit({ id: true });

export class CreateNetworkDto extends createZodDto(CreateNetworkSchema) {}
