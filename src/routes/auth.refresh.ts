import { Hono } from "hono";
import { verifyJwtToken } from "../services/verify_jwt_token.js";
import { createJwtToken } from "../services/create_jwt_token.js";
import {
  calculateTokenTTL,
  getRefreshTokenTTL,
  getAccessTokenTTL,
} from "../services/calculate_token_ttl.js";
import { database } from "../database.js";

const application = new Hono();

application.post("/refresh", async (context) => {
  const { refreshToken } = await context.req.json();
  if (!refreshToken) return context.body(null, 401);

  const payload = await verifyJwtToken(refreshToken);
  if (!payload) return context.body(null, 401);

  const currentUser = context.var.current_user;

  const refreshTokenUser = await database
    .selectFrom("users")
    .innerJoin("jwt_refresh_tokens", "users.id", "jwt_refresh_tokens.user_id")
    .where("jwt_refresh_tokens.token", "=", refreshToken)
    .where("users.id", "=", currentUser.id)
    .selectAll()
    .executeTakeFirst();

  if (!refreshTokenUser) return context.body(null, 401);

  const newRefreshToken = await createJwtToken(calculateTokenTTL(getRefreshTokenTTL()));
  const newAccessToken = await createJwtToken(calculateTokenTTL(getAccessTokenTTL()));

  return await database.transaction().execute(async (transaction) => {
    await transaction
      .updateTable("jwt_refresh_tokens")
      .set({
        token: newRefreshToken,
      })
      .where("token", "=", refreshToken)
      .execute();

    await transaction
      .insertInto("jwt_authorization_tokens")
      .values({
        token: newAccessToken,
        user_id: refreshTokenUser.id,
      })
      .execute();

    return context.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

export default application;
