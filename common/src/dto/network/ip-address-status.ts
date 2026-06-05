import { createZodDto } from "nestjs-zod";
import { IpAddressStatusSchema } from "../../schemas/network/ip-address-status.js";

export class IpAddressStatusDto extends createZodDto(IpAddressStatusSchema) {}
