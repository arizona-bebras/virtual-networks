import { createZodDto } from "nestjs-zod";
import { NetworkEnterCredentialsSchema } from "../../schemas/network/enter-credentials.js";

export class NetworkEnterCredentialsDto extends createZodDto(
  NetworkEnterCredentialsSchema,
) {}
