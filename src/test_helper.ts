import { beforeEach } from "vitest";
import { database } from "./database.js";
import { sql } from "kysely";
import type { Database } from "./types.js";
import type { TableExpression } from "kysely";
import { createJwtToken } from "./services/create_jwt_token.js";
import configuration from "./configuration.js";

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

export async function signIn(
  userId: string | number,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = await createJwtToken(configuration.jwtExpirationTimeAccessToken * 1000);
  const refreshToken = await createJwtToken(configuration.jwtExpirationTimeRefreshToken * 1000);

  await database.transaction().execute(async (transaction) => {
    await transaction
      .insertInto("jwt_authorization_tokens")
      .values({ token: accessToken, user_id: userId })
      .execute();
  });

  await database.transaction().execute(async (transaction) => {
    await transaction
      .insertInto("jwt_refresh_tokens")
      .values({ token: refreshToken, user_id: userId })
      .execute();
  });

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
}

export function getRandomEmail() {
  return `${Math.random().toString(36).substring(2)}@test.com`;
}
