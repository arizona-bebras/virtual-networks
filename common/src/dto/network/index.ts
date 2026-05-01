import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { NetworkSchema } from "../../schemas/network/index.js";

export class NetworkDto extends createZodDto(
  NetworkSchema.extend({
    devicesCount: z.number(),
  }),
) {}
