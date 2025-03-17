import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { Hono } from "hono";
import { Resend } from "resend";
import configuration from "../configuration.js";

const application = new Hono();

application.post("/login", async (context) => {
  const { email } = await context.req.json();
  if (!email) return context.body(null, 401);

  const authToken = await createJwtToken(configuration.accessTokenExpirationTime * 1000);
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

    const resend = new Resend(configuration.resendApiKey);
    const resendResponse = await resend.emails.send({
      from: configuration.emailFrom,
      to: email,
      subject: "Your Magic Link",
      html: `Click here to login: <a href="${magicLink}">${magicLink}</a>`,
    });

    if (resendResponse.error) {
      throw new Error(resendResponse.error.message);
    }

    return context.body(null, 200);
  });
});

export default application;
