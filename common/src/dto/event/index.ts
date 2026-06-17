import { createZodDto } from "nestjs-zod";
import {
  EventSchema,
} from "../../schemas/event/index.js";

export class EventDto extends createZodDto(EventSchema) {}