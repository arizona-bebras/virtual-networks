import { Global, Module } from "@nestjs/common";
import type { ExtractTablesFromSchema } from "drizzle-orm";
import "dotenv/config";
import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import { postgresUrl } from "./connection";
import * as schema from "./schema";

export const DRIZZLE = "DRIZZLE";
type DatabaseSchema = ExtractTablesFromSchema<typeof schema>;
export type Database = NodePgDatabase<
  DatabaseSchema,
  typeof schema.relations
> & {
  $client: Pool;
};

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: async () => {
        const db: Database = drizzle<DatabaseSchema, typeof schema.relations>(
          postgresUrl,
          {
            schema: schema,
            relations: schema.relations,
            logger: true,
          },
        );

        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

        return db;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
