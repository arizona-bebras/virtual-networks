import { z } from "zod";

export const DeviceSchema = z.object({
  id: z.uuid().describe("The unique identifier of the device"),
  name: z.string().min(1).max(255).describe("The name of the device"),
  ip: z.ipv4().describe("The IP address of the device"),
  ownerId: z.string().describe("The identifier of the device owner"),
});
