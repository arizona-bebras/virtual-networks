import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const NetworkSchema = z.object({
  id: z.uuid().describe("The unique identifier of the network"),
  name: z.string().min(1).max(255).describe("The name of the network"),
  description: z.string().max(1024).describe("A description of the network"),
  ip: z.ipv4().describe("The IP address of the network"),
});

export class NetworkDto extends createZodDto(NetworkSchema) {}
