import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { TagSchema } from "../../schemas/tag/index.js";

export class TagDto extends createZodDto(
  TagSchema.extend({
    devicesCount: z.number(),
  }),
) {}
