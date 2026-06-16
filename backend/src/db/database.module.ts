import { Global, Module } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { ClsModule } from "nestjs-cls";
import type { ExtractTablesFromSchema } from "drizzle-orm";
import "dotenv/config";
import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import { postgresUrl } from "./connection.js";
import * as schema from "./schema.js";

export const RAW_DRIZZLE = "RAW_DRIZZLE";

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
  imports: [
      ClsModule.forRoot({
        global: true,
        middleware: { mount: false },
      }),
    ],
  providers: [
    {
      provide: RAW_DRIZZLE,
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
    {
      provide: DRIZZLE,
      inject: [ClsService, RAW_DRIZZLE],
      useFactory: (cls: ClsService, rawDb: Database) => {
        return new Proxy(rawDb, {
          get(target, prop) {
            const tx = cls.get("CURRENT_TRANSACTION");
            console.log(tx ? "transaction" : "single")
            return tx ? tx[prop] : target[prop];
          },
        });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
