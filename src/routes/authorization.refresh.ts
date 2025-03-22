import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { Hono } from "hono";
import { verifyJwtToken } from "../services/verify_jwt_token.js";
import configuration from "../configuration.js";

const application = new Hono();

application.post("/", async (context) => {
  const requestPayload = await context.req.text();
  if (!requestPayload) return context.body(null, 401);

  const { refreshToken } = JSON.parse(requestPayload);
  if (!refreshToken) return context.body(null, 401);

  const jwtPayload = await verifyJwtToken(refreshToken);
  if (!jwtPayload) return context.body(null, 401);

  const currentUser = context.var.currentUser;

  const refreshTokenUser = await database
    .selectFrom("users")
    .innerJoin("jwt_refresh_tokens", "users.id", "jwt_refresh_tokens.user_id")
    .where("jwt_refresh_tokens.token", "=", refreshToken)
    .where("users.id", "=", currentUser.id)
    .selectAll("users")
    .executeTakeFirst();

  if (!refreshTokenUser) return context.body(null, 401);

  const newAccessToken = await createJwtToken(configuration.jwtExpirationTimeAccessToken * 1000);
  const newRefreshToken = await createJwtToken(configuration.jwtExpirationTimeRefreshToken * 1000);

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
