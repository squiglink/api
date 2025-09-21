import configuration from "../configuration.js";
import zod from "zod";
import { Hono } from "hono";
import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";
import { verifyJwtToken } from "../services/verify_jwt_token.js";

const application = new Hono();

const jsonSchema = zod.object({
  refresh_token: zod.string(),
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

application.post(
  "/authorization/refresh",
  routeDescription,
  validator("json", jsonSchema),
  async (context) => {
    const jsonParameters = context.req.valid("json");

    const jwtPayload = await verifyJwtToken(jsonParameters.refresh_token);
    if (!jwtPayload) return context.body(null, 401);

    const refreshTokenUser = await database
      .selectFrom("users")
      .innerJoin("jwt_refresh_tokens", "users.id", "jwt_refresh_tokens.user_id")
      .where("jwt_refresh_tokens.token", "=", jsonParameters.refresh_token)
      .selectAll("users")
      .executeTakeFirst();
    if (!refreshTokenUser) return context.body(null, 401);

    const newAccessToken = await createJwtToken(configuration.jwtExpirationTimeAccessToken * 1000);
    const newRefreshToken = await createJwtToken(
      configuration.jwtExpirationTimeRefreshToken * 1000,
    );

    return await database.transaction().execute(async (transaction) => {
      await transaction
        .updateTable("jwt_refresh_tokens")
        .set({ token: newRefreshToken })
        .where("token", "=", jsonParameters.refresh_token)
        .execute();
      await transaction
        .insertInto("jwt_access_tokens")
        .values({ token: newAccessToken, user_id: refreshTokenUser.id })
        .execute();

      return context.json({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      });
    });
  },
);

export default application;
