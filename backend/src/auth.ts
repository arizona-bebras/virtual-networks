import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { localization } from "better-auth-localization";
import { drizzle } from "drizzle-orm/node-postgres";
import { postgresUrl } from "./db/connection.js";
import * as schema from "./db/schema.js";
import { relations } from "./db/schema.js";

const db = drizzle(postgresUrl, { relations });

const authOptions: BetterAuthOptions = {
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins:
    process.env.TRUSTED_ORIGINS?.split(",").map((o) => o.trim()) || [],
  plugins: [
    localization({
      defaultLocale: "ru-RU",
      fallbackLocale: "default",
    }),
  ],
};

export const auth = betterAuth(authOptions);
