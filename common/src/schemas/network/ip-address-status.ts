import { z } from "zod";

export const IpStatusEnum = z.enum([
  "available",
  "alreadyInUse",
  "outOfSubnet",
]);

export const IpAddressStatusSchema = z.object({
  status: IpStatusEnum.describe("The status of the address in the network"),
  ownerHostName: z
    .string()
    .nullable()
    .optional()
    .describe(
      "The name of the host that owns the address, if address is already in use",
    ),
});
