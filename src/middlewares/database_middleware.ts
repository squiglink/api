import { createMiddleware } from "hono/factory";
import { database } from "../database.js";
import { Kysely } from "kysely";
import type { Database } from "../types.js";

export const databaseMiddleware = createMiddleware<{
  Variables: {
    database: Kysely<Database>;
  };
}>(async (context, next) => {
  context.set("database", database);
  await next();
});
