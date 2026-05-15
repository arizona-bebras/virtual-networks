import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../src/db/schema.js";

export const createTestDatabase = async () => {
  const client = new PGlite();
  const db = drizzle({
    client,
    schema,
    relations: schema.relations,
  });

  await migrate(db, { migrationsFolder: "./drizzle" });

  return db;
};

export type TestDatabase = Awaited<ReturnType<typeof createTestDatabase>>;

export const closeTestDatabase = async (db?: TestDatabase) => {
  await db?.$client.close();
};
