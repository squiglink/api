import { beforeEach } from "vitest";
import { database } from "./database.js";
import { sql } from "kysely";

beforeEach(async () => {
  await sql`truncate table ${sql.table("brands")} cascade`.execute(database);
  await sql`truncate table ${sql.table("databases")} cascade`.execute(database);
  await sql`truncate table ${sql.table("evaluations")} cascade`.execute(database);
  await sql`truncate table ${sql.table("measurements")} cascade`.execute(database);
  await sql`truncate table ${sql.table("models")} cascade`.execute(database);
  await sql`truncate table ${sql.table("users")} cascade`.execute(database);
});
