import { env } from "process";
import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type { Database } from "./types.js";

const int8TypeId = 20;
pg.types.setTypeParser(int8TypeId, (value) => parseInt(value, 10));

const { Pool } = pg;

export function newDatabase(): Kysely<Database> {
  return new Kysely<Database>({ dialect: newDialect() });
}

export function newDialect(): PostgresDialect {
  return new PostgresDialect({
    pool: newPool(),
  });
}

export function newPool(): pg.Pool {
  return new Pool({
    database: env.SQUIGLINK_POSTGRES_DATABASE,
    host: env.SQUIGLINK_POSTGRES_HOST,
    password: env.SQUIGLINK_POSTGRES_PASSWORD,
    user: env.SQUIGLINK_POSTGRES_USER,
  });
}
