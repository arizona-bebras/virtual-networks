import { createZodDto } from "nestjs-zod";
import { NetworkUsersSchema } from "../../schemas/network/network-users.js";

export class NetworkUsersDto extends createZodDto(NetworkUsersSchema) {}
