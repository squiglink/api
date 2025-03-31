import { beforeEach } from "vitest";
import { database } from "./database.js";
import {
  insertJwtAuthorizationToken,
  insertJwtRefreshToken,
  insertUser,
} from "./test_helper.factories.js";
import { sql } from "kysely";
import type { Database } from "./types.js";
import type { TableExpression } from "kysely";

beforeEach(async () => {
  await truncateTableCascade("brands");
  await truncateTableCascade("databases");
  await truncateTableCascade("evaluations");
  await truncateTableCascade("jwt_authorization_tokens");
  await truncateTableCascade("jwt_magic_link_tokens");
  await truncateTableCascade("jwt_refresh_tokens");
  await truncateTableCascade("measurements");
  await truncateTableCascade("models");
  await truncateTableCascade("users");
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

export async function signIn(
  userId?: string,
): Promise<{ authorizationToken: string; refreshToken: string }> {
  const { authorizationToken, refreshToken } = await database
    .transaction()
    .execute(async (transaction) => {
      const id = userId || (await insertUser(transaction)).id;
      return {
        authorizationToken: (await insertJwtAuthorizationToken(transaction, { user_id: id })).token,
        refreshToken: (await insertJwtRefreshToken(transaction, { user_id: id })).token,
      };
    });

  return { authorizationToken, refreshToken };
}
