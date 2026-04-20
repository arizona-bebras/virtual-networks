import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
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
  plugins: [jwt()],
};

export const auth = betterAuth(authOptions);
