import { beforeEach } from "vitest";
import { database } from "./database.js";
import { sql } from "kysely";
import type { Database } from "./types.js";
import type { TableExpression } from "kysely";

beforeEach(async () => {
  truncateTableCascade("brands");
  truncateTableCascade("databases");
  truncateTableCascade("evaluations");
  truncateTableCascade("measurements");
  truncateTableCascade("models");
  truncateTableCascade("users");
});

async function truncateTableCascade(tableName: string) {
  await sql`truncate table ${sql.table(tableName)} cascade`.execute(database);
}

export async function count(tableName: TableExpression<Database, never>): Promise<number> {
  return Number(
    (
      await database
        .selectFrom(tableName)
        .select(database.fn.countAll().as("count"))
        .executeTakeFirstOrThrow()
    ).count,
  );
}
