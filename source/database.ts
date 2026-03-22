import configuration from "./configuration.js";
import type { Database } from "./types.js";
import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import { SQL } from "bun";

export const database = new Kysely<Database>({
  dialect: new PostgresJSDialect({
    postgres: new SQL({
      bigint: true,
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
