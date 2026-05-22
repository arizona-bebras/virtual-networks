import { z } from "zod";

export const DeviceCfgSchema = z.object({
  name: z.string().min(1).max(255).describe("The name of the .conf file"),
  config: z.string().describe("The data of config"),
  clientPublicKey: z.string().describe("The public key of client"),
  qrCode: z.string().describe("base64 encoded qrcode image"),
});
