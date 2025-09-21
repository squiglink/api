import { beforeEach } from "vitest";
import { database } from "./database.js";
import {
  insertJwtAccessToken,
  insertJwtRefreshToken,
  insertUser,
} from "./test_helper.factories.js";
import { sql } from "kysely";

beforeEach(async () => {
  await truncateAllTables();
});

async function truncateAllTables() {
  const tableNames = (
    await database
      .selectFrom("information_schema.tables" as any)
      .select("table_name")
      .where("table_schema", "=", "public")
      .where("table_type", "=", "BASE TABLE")
      .orderBy("table_name")
      .execute()
  ).map((row) => row.table_name);

  tableNames.map((tableName) =>
    sql`truncate table ${sql.table(tableName)} cascade`.execute(database),
  );
}

export async function count(tableName: string): Promise<number> {
  return Number(
    (
      await database
        .selectFrom(tableName as any)
        .select(database.fn.countAll().as("count"))
        .executeTakeFirstOrThrow()
    ).count,
  );
}

export async function signIn(
  userId?: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const { accessToken, refreshToken } = await database
    .transaction()
    .execute(async (transaction) => {
      const id = userId || (await insertUser(transaction)).id;
      return {
        accessToken: (await insertJwtAccessToken(transaction, { user_id: id })).token,
        refreshToken: (await insertJwtRefreshToken(transaction, { user_id: id })).token,
      };
    });

  return { accessToken, refreshToken };
}
