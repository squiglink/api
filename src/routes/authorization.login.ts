import configuration from "../configuration.js";
import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { Hono } from "hono";
import { sendMail } from "../services/send_mail.js";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const application = new Hono();

application.post("/", async (context) => {
  const payload = await context.req.text();
  if (!payload) return context.body(null, 401);
  const { email } = JSON.parse(payload);
  if (!email) return context.body(null, 401);
  if (!EMAIL_REGEX.test(email)) return context.body(null, 401);

  const authToken = await createJwtToken(configuration.jwtExpirationTimeMagicLinkToken * 1000);
  const magicLink = `${configuration.applicationUrl}/auth/verify?token=${authToken}`;
  const user = await database
    .selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .limit(1)
    .executeTakeFirst();
  if (!user) return context.body(null, 401);

  return await database.transaction().execute(async (transaction) => {
    await transaction
      .insertInto("jwt_magic_link_tokens")
      .values({
        token: authToken,
        user_id: user.id,
      })
      .execute();

    if (
      configuration.applicationEnvironment === "production" ||
      configuration.applicationEnvironment === "test"
    ) {
      await sendMail({
        to: email,
        subject: "Your Magic Link",
        body: `Click here to login: <a href="${magicLink}">${magicLink}</a>`,
      });
    }

    console.log("MAGIC LINK:", magicLink);

    return context.body(null, 200);
  });
});

export default application;
