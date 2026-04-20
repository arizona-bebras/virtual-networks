import { Global, Module } from "@nestjs/common";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { postgresUrl } from "./connection";
import * as schema from "./schema";

export const DRIZZLE = "DRIZZLE";

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: () => {
        const pool = new Pool({
          connectionString: postgresUrl,
        });
        return drizzle({ client: pool, schema: schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
