import { createZodDto } from "nestjs-zod";
import { NetworkSchema } from "./index.js";

export const UpdateNetworkSchema = NetworkSchema.omit({ id: true }).partial();

export class UpdateNetworkDto extends createZodDto(UpdateNetworkSchema) {}
