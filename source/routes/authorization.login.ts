import configuration from "../configuration.js";
import zod from "zod";
import { Hono } from "hono";
import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { describeRoute, validator } from "hono-openapi";
import { sendEmail } from "../services/send_email.js";
import { validateCloudflareTurnstileToken } from "../services/validate_cloudflare_turnstile_token.js";

const application = new Hono();

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

const jsonSchema = zod.object({
  cloudflareTurnstileToken: zod.string().optional(),
  email: zod.email(),
});

const routeDescription = describeRoute({
  responses: {
    200: { description: "OK" },
    401: { description: "Unauthorized" },
  },
});

application.post(
  "/authorization/login",
  routeDescription,
  validator("header", headerSchema),
  validator("json", jsonSchema),
  async (context) => {
    const headerParameters = context.req.valid("header");
    const jsonParameters = context.req.valid("json");

    if (configuration.cloudflareTurnstileEnabled) {
      if (!jsonParameters.cloudflareTurnstileToken) return context.body(null, 401);

      const remoteIp = headerParameters["cf-connecting-ip"] || headerParameters["x-forwarded-for"];
      if (!remoteIp) throw new Error("Reached unreachable.");

      const cloudflareTurnstileResponse = await validateCloudflareTurnstileToken(
        remoteIp,
        jsonParameters.cloudflareTurnstileToken,
      );
      if (!cloudflareTurnstileResponse.success) return context.body(null, 401);
    }

    const user = await database
      .selectFrom("users")
      .selectAll()
      .where("email", "=", jsonParameters.email)
      .executeTakeFirst();
    if (!user) return context.body(null, 401);

    const authToken = await createJwtToken(configuration.jwtExpirationTimeMagicLinkToken * 1000);
    const magicLink = `${configuration.studioUrl}/auth/verify?token=${authToken}`;

    const emailResponse = await sendEmail({
      body: `Follow the link to login: <a href="${magicLink}">${magicLink}</a>.`,
      subject: "Log into Squiglink",
      to: jsonParameters.email,
    });
    if (emailResponse.success === false) return context.body(null, 401);

    await database.transaction().execute(async (transaction) => {
      await transaction
        .insertInto("jwt_magic_link_tokens")
        .values({ token: authToken, user_id: user.id })
        .executeTakeFirstOrThrow();
    });

    return context.body(null, 200);
  },
);

export default application;
