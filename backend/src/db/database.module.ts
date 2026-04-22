import { Global, Module } from "@nestjs/common";
import "dotenv/config";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { postgresUrl } from "./connection";
import * as schema from "./schema";

export const DRIZZLE = "DRIZZLE";

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: async () => {
        const db = drizzle(postgresUrl, {
          schema: schema,
          logger: true
        });

        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

        return db;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
