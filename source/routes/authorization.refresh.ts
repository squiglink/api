import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation_middleware.js";
import { verifyJwtToken } from "../services/verify_jwt_token.js";
import configuration from "../configuration.js";
import zod from "zod";

const schema = zod.object({
  refresh_token: zod.string(),
});

const application = new Hono<{
  Variables: { bodyParameters: zod.infer<typeof schema> };
}>();

application.post(
  "/authorization/refresh",
  validationMiddleware({ bodySchema: schema, statusCode: 401 }),
  async (context) => {
    const bodyParameters = context.get("bodyParameters");

    const jwtPayload = await verifyJwtToken(bodyParameters.refresh_token);
    if (!jwtPayload) return context.body(null, 401);

    const refreshTokenUser = await database
      .selectFrom("users")
      .innerJoin("jwt_refresh_tokens", "users.id", "jwt_refresh_tokens.user_id")
      .where("jwt_refresh_tokens.token", "=", bodyParameters.refresh_token)
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
        .where("token", "=", bodyParameters.refresh_token)
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
