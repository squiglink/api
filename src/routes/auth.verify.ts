import { calculateTokenTTL } from "../services/calculate_token_ttl.js";
import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { getAccessTokenTTL, getRefreshTokenTTL } from "../services/calculate_token_ttl.js";
import { Hono } from "hono";
import { verifyJwtToken } from "../services/verify_jwt_token.js";

import type { Selectable, Transaction } from "kysely";
import type { Database, Users } from "../types.js";

const application = new Hono();

application.get("/verify", async (context) => {
  const authToken = context.req.query("token");
  if (!authToken) return context.body(null, 401);

  const payload = await verifyJwtToken(authToken);
  if (!payload) return context.body(null, 401);

  const user = await getUserByEmailAuthToken(authToken);
  if (!user) return context.body(null, 401);

  return await database.transaction().execute(async (transaction) => {
    const session = await createSession(transaction, user);

    await transaction.deleteFrom("jwt_magic_link_tokens").where("token", "=", authToken).execute();

    return context.json({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    });
  });
});

export default application;

async function createSession(
  transaction: Transaction<Database>,
  user: Selectable<Users>,
): Promise<{ access_token: string; refresh_token: string }> {
  const accessToken = await createJwtToken(calculateTokenTTL(getAccessTokenTTL()));
  const refreshToken = await createJwtToken(calculateTokenTTL(getRefreshTokenTTL()));

  await transaction
    .insertInto("jwt_authorization_tokens")
    .values({
      token: accessToken,
      user_id: user.id,
    })
    .execute();

  await transaction
    .insertInto("jwt_refresh_tokens")
    .values({
      token: refreshToken,
      user_id: user.id,
    })
    .execute();

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}

async function getUserByEmailAuthToken(token: string): Promise<Selectable<Users> | undefined> {
  return await database
    .selectFrom("users")
    .innerJoin("jwt_magic_link_tokens", "users.id", "jwt_magic_link_tokens.user_id")
    .where("jwt_magic_link_tokens.token", "=", token)
    .selectAll()
    .limit(1)
    .executeTakeFirst();
}
