import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { Hono } from "hono";
import { verifyJwtToken } from "../services/verify_jwt_token.js";
import configuration from "../configuration.js";

const application = new Hono();

application.get("/authorization/verify", async (context) => {
  const magicLinkToken = context.req.query("token");
  if (!magicLinkToken) return context.body(null, 401);

  const payload = await verifyJwtToken(magicLinkToken);
  if (!payload) return context.body(null, 401);

  const user = await database
    .selectFrom("users")
    .innerJoin("jwt_magic_link_tokens", "users.id", "jwt_magic_link_tokens.user_id")
    .where("jwt_magic_link_tokens.token", "=", magicLinkToken)
    .selectAll("users")
    .executeTakeFirst();
  if (!user) return context.body(null, 401);

  return await database.transaction().execute(async (transaction) => {
    const accessToken = await createJwtToken(configuration.jwtExpirationTimeAccessToken * 1000);
    const refreshToken = await createJwtToken(configuration.jwtExpirationTimeRefreshToken * 1000);

    await transaction
      .insertInto("jwt_access_tokens")
      .values({ token: accessToken, user_id: user.id })
      .execute();
    await transaction
      .insertInto("jwt_refresh_tokens")
      .values({ token: refreshToken, user_id: user.id })
      .execute();
    await transaction
      .deleteFrom("jwt_magic_link_tokens")
      .where("token", "=", magicLinkToken)
      .execute();

    return context.json({ accessToken, refreshToken });
  });
});

export default application;
