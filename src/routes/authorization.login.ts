import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { Hono } from "hono";
import { sendEmail } from "../services/send_email.js";
import { validationMiddleware } from "../middlewares/validation_middleware.js";
import configuration from "../configuration.js";
import zod from "zod";

const bodySchema = zod.object({
  email: zod.email(),
});

const application = new Hono<{
  Variables: { bodyParameters: zod.infer<typeof bodySchema> };
}>();

application.post(
  "/authorization/login",
  validationMiddleware({ bodySchema, statusCode: 401 }),
  async (context) => {
    const bodyParameters = context.get("bodyParameters");

    const user = await database
      .selectFrom("users")
      .selectAll()
      .where("email", "=", bodyParameters.email)
      .executeTakeFirst();
    if (!user) return context.body(null, 401);

    const authToken = await createJwtToken(configuration.jwtExpirationTimeMagicLinkToken * 1000);
    const magicLink = `${configuration.studioUrl}/auth/verify?token=${authToken}`;

    return await database.transaction().execute(async (transaction) => {
      await transaction
        .insertInto("jwt_magic_link_tokens")
        .values({ token: authToken, user_id: user.id })
        .executeTakeFirstOrThrow();

      try {
        await sendEmail({
          body: `Follow the link to login: <a href="${magicLink}">${magicLink}</a>.`,
          subject: "Log into Squiglink",
          to: bodyParameters.email,
        });
      } catch {
        return context.body(null, 401);
      }

      return context.body(null, 200);
    });
  },
);

export default application;
