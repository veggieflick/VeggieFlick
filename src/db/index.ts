import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/veggieflick";

const globalForDb = globalThis as typeof globalThis & {
  __veggieflickPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__veggieflickPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__veggieflickPostgresqlPool = pool;
}

export const db = drizzle(pool, { schema });
