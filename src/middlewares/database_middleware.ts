import { createMiddleware } from "hono/factory";
import { Kysely } from "kysely";
import { newDatabase } from "../database.js";
import type { Database } from "../types.js";

export const databaseMiddleware = createMiddleware<{
  Variables: {
    database: Kysely<Database>;
  };
}>(async (context, next) => {
  const database = newDatabase();
  context.set("database", database);
  await next();
});
