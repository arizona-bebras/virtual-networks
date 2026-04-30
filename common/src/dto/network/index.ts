import { createZodDto } from "nestjs-zod";
import { NetworkSchema } from "../../schemas/network/index.js";
import { z } from "zod";

export class NetworkDto extends createZodDto(
  NetworkSchema.extend({
    devicesCount: z.number(),
  }),
) {}
