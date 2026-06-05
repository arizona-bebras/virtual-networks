import { createInsertSchema } from "drizzle-orm/zod";
import { z } from "zod";
import { peerStates } from "../../db/schema.js";

export const PeerStateSchema = createInsertSchema(peerStates, {
  isOnline: (schema) => schema.describe("The status of the device"),
  lastHandshakeTime: () =>
    z
      .string()
      .datetime()
      .nullable()
      .optional()
      .describe("The timestamp of the last handshake"),
  bytesReceived: () => z.string().describe("Count of the received bytes"),

  bytesSent: () => z.string().describe("Count of the sent bytes"),
}).omit({ id: true, deviceId: true, updatedAt: true });

export type PeerState = z.infer<typeof PeerStateSchema>;
