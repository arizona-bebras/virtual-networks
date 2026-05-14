import { defineConfig } from "drizzle-kit";
import { postgresUrl } from "./src/db/connection.js";

export default defineConfig({
  out: "./drizzle",
  schema: "../common/src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: postgresUrl,
  },
});
