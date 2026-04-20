import { defineConfig } from "drizzle-kit";
import { postgresUrl } from "./src/db/connection";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: postgresUrl,
  },
});
