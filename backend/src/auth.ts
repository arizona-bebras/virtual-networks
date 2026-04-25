import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { localization } from "better-auth-localization";
import { drizzle } from "drizzle-orm/node-postgres";
import { postgresUrl } from "./db/connection";
import * as schema from "./db/schema";
import { relations } from "./db/schema";

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
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || [],
  plugins: [
    jwt(),
    localization({
      defaultLocale: "ru-RU",
      fallbackLocale: "default",
    }),
  ],
};

export const auth = betterAuth(authOptions);
