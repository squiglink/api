import { beforeAll, beforeEach, vi } from "vitest";
import { env } from "process";
import { newDatabase } from "./database.js";
import { sql } from "kysely";

beforeAll(() => {
  vi.stubEnv(
    "SQUIGLINK_POSTGRES_DATABASE",
    env.SQUIGLINK_POSTGRES_TEST_DATABASE,
  );
});

beforeEach(async () => {
  const database = newDatabase();

  await sql`truncate table ${sql.table("databases")} cascade`.execute(database);
  await sql`truncate table ${sql.table("users")} cascade`.execute(database);
});
