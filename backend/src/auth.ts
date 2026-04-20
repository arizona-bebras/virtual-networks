import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/node-postgres";
import { postgresUrl } from "./db/connection";
import { localization } from "better-auth-localization";
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
  trustedOrigins: ["http://localhost:5173"],
  plugins: [
    jwt(),
    localization({
      defaultLocale: "ru-RU",
      fallbackLocale: "default",
    }),
  ],
};

export const auth = betterAuth(authOptions);
