import { createZodDto } from "nestjs-zod";
import { PeerStateSchema } from "../../schemas/device/peer-state.js";

export class PeerStateDto extends createZodDto(PeerStateSchema) {}
