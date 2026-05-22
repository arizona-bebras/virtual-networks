import { z } from "zod";

export const NetworkCfgSchema = z.object({
  name: z.string().min(1).max(255).describe("The name of the .conf file"),
  config: z.string().describe("The data of config"),
  qrCode: z.string().describe("base64 encoded qrcode image"),
});
