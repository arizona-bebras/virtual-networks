import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { relations } from './schema';

const host = process.env.POSTGRES_HOST ?? 'localhost';
const port = Number(process.env.POSTGRES_PORT ?? 5432);
const user = process.env.POSTGRES_USER ?? 'postgres';
const password = process.env.POSTGRES_PASSWORD ?? '';
const database = process.env.POSTGRES_DB ?? 'postgres';

export const db = drizzle(
  `postgresql://${user}:${password}@${host}:${port}/${database}`,
  { relations },
);
