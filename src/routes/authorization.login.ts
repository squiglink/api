import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { Hono } from "hono";
import { sendEmail } from "../services/send_email.js";
import { validateCloudflareTurnstileToken } from "../services/validate_cloudflare_turnstile_token.js";
import { validationMiddleware } from "../middlewares/validation_middleware.js";
import configuration from "../configuration.js";
import zod from "zod";

const bodySchema = zod.object({
  cloudflareTurnstileToken: zod.string().optional(),
  email: zod.email(),
});

const headerSchema = zod
  .object({
    "cf-connecting-ip": zod.string().optional(),
    "x-forwarded-for": zod.string().optional(),
  })
  .refine((data) => {
    if (configuration.cloudflareTurnstileEnabled) {
      return data["cf-connecting-ip"] || data["x-forwarded-for"];
    }

    return true;
  });

const application = new Hono<{
  Variables: {
    headerParameters: zod.infer<typeof headerSchema>;
    bodyParameters: zod.infer<typeof bodySchema>;
  };
}>();

application.post(
  "/authorization/login",
  validationMiddleware({ headerSchema, bodySchema, statusCode: 401 }),
  async (context) => {
    const headerParameters = context.get("headerParameters");
    const bodyParameters = context.get("bodyParameters");

    if (configuration.cloudflareTurnstileEnabled) {
      if (!bodyParameters.cloudflareTurnstileToken) return context.body(null, 401);

      const remoteIp = headerParameters["cf-connecting-ip"] || headerParameters["x-forwarded-for"];
      if (!remoteIp) throw new Error("Reached unreachable");

      const cloudflareTurnstileResponse = await validateCloudflareTurnstileToken(
        bodyParameters.cloudflareTurnstileToken,
        remoteIp,
      );

      if (!cloudflareTurnstileResponse.success) return context.body(null, 401);
    }

    const authToken = await createJwtToken(configuration.jwtExpirationTimeMagicLinkToken * 1000);
    const magicLink = `${configuration.studioUrl}/auth/verify?token=${authToken}`;
    const user = await database
      .selectFrom("users")
      .selectAll()
      .where("email", "=", bodyParameters.email)
      .executeTakeFirst();
    if (!user) return context.body(null, 401);

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
