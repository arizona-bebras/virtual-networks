import { createZodDto } from "nestjs-zod";
import { TagSchema } from "../../schemas/tag/index.js";
import { z } from "zod";

export class TagDto extends createZodDto(
  TagSchema.extend({
    devicesCount: z.number(),
  }),
) {}
