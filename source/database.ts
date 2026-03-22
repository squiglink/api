import configuration from "./configuration.js";
import type { Database } from "./types.js";
import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import { SQL } from "bun";

export function connect(db = configuration.postgresDatabase) {
  return new SQL({
    bigint: true,
    database: db,
    host: configuration.postgresHost,
    password: configuration.postgresPassword,
    user: configuration.postgresUser,
  });
}

export const database = new Kysely<Database>({
  dialect: new PostgresJSDialect({
    postgres: connect(),
  }),
});

export function touch() {
  return {
    updated_at: new Date(),
  };
}
