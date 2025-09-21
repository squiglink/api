import configuration from "../configuration.js";
import zod from "zod";
import { Hono } from "hono";
import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";
import { verifyJwtToken } from "../services/verify_jwt_token.js";

const application = new Hono();

const querySchema = zod.object({
  token: zod.string(),
});

const responseSchema = zod.object({
  access_token: zod.string(),
  refresh_token: zod.string(),
});

const routeDescription = describeRoute({
  responses: {
    200: {
      content: {
        "application/json": {
          schema: resolver(responseSchema),
        },
      },
      description: "OK",
    },
    401: { description: "Unauthorized" },
  },
});

application.get(
  "/authorization/verify",
  routeDescription,
  validator("query", querySchema),
  async (context) => {
    const queryParameters = context.req.valid("query");

    const magicLinkToken = queryParameters.token;

    const jwtPayload = await verifyJwtToken(magicLinkToken);
    if (!jwtPayload) return context.body(null, 401);

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

      return context.json({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    });
  },
);

export default application;
