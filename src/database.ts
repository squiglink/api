import { env } from "process";
import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type { Database } from "./types.js";

const { Pool } = pg;

const int8TypeId = 20;
pg.types.setTypeParser(int8TypeId, (value) => parseInt(value, 10));

const timestampTypeId = 1114;
pg.types.setTypeParser(timestampTypeId, (value) => new Date(value).toISOString());

export const database = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: env.SQUIGLINK_POSTGRES_DATABASE,
      host: env.SQUIGLINK_POSTGRES_HOST,
      password: env.SQUIGLINK_POSTGRES_PASSWORD,
      user: env.SQUIGLINK_POSTGRES_USER,
    }),
  }),
});

export function touch() {
  return {
    updated_at: new Date(),
  };
}
