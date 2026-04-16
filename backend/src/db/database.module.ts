import { Global, Module } from "@nestjs/common";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const HOST = process.env.POSTGRES_HOST ?? "localhost";
const PORT = Number(process.env.POSTGRES_PORT ?? 5432);
const USER = process.env.POSTGRES_USER ?? "postgres";
const PASSWORD = process.env.POSTGRES_PASSWORD ?? "";
const DATABASE = process.env.POSTGRES_DB ?? "postgres";

const URL = `postgresql://${USER}:${PASSWORD}@${HOST}:${PORT}/${DATABASE}`;

export const DRIZZLE = "DRIZZLE";

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: () => {
        const pool = new Pool({
          connectionString: URL,
        });
        return drizzle({ client: pool, schema: schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
