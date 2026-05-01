import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { NetworkRelationsSchema } from "../../schemas/network/index.js";

export class NetworkDto extends createZodDto(
  NetworkRelationsSchema.extend({
    devicesCount: z.number(),
  }),
) {}
