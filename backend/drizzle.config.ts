import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const host = process.env.POSTGRES_HOST ?? "localhost";
const port = Number(process.env.POSTGRES_PORT) ?? 5432;
const user = process.env.POSTGRES_USER ?? "postgres";
const password = process.env.POSTGRES_PASSWORD ?? "";
const database = process.env.POSTGRES_DB ?? "postgres";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: `postgresql://${user}:${password}@${host}:${port}/${database}`,
	},
});
