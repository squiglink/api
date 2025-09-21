import { Kysely, PostgresDialect } from "kysely";
import configuration from "./configuration.js";
import pg from "pg";
import type { Database } from "./types.js";

const { Pool } = pg;

pg.types.setTypeParser(pg.types.builtins.INT8, (value) => parseInt(value, 10));
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (value) => new Date(value).toISOString());

export const database = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: configuration.postgresDatabase,
      host: configuration.postgresHost,
      password: configuration.postgresPassword,
      user: configuration.postgresUser,
    }),
  }),
});

export function touch() {
  return {
    updated_at: new Date(),
  };
}
