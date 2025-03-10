import { calculateTokenTTL, getEmailAuthTokenTTL } from "../services/calculate_token_ttl.js";
import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { env } from "process";
import { Hono } from "hono";
import { Resend } from "resend";

import type { Selectable } from "kysely";
import type { Users } from "../types.js";

const application = new Hono();

application.post("/login", async (context) => {
  const { email } = await context.req.json();
  if (!email) return context.body(null, 401);

  const authToken = await createJwtToken(calculateTokenTTL(getEmailAuthTokenTTL()));
  const magicLink = `${getApplicationUrlFromEnv()}/auth/verify?token=${authToken}`;
  const user = await getUserByEmail(email);
  if (!user) return context.body(null, 401);

  return await database.transaction().execute(async (transaction) => {
    await transaction
      .insertInto("jwt_magic_link_tokens")
      .values({
        token: authToken,
        user_id: user.id,
      })
      .execute();

    const resend = new Resend(getResendApiKeyFromEnv());
    const resendResponse = await resend.emails.send({
      from: getAuthEmailFromEnv(),
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

function getAuthEmailFromEnv() {
  if (env.SQUIGLINK_AUTHENTICATION_EMAIL === undefined)
    throw new Error("AUTHENTICATION_EMAIL is not set");

  return env.SQUIGLINK_AUTHENTICATION_EMAIL;
}

function getApplicationUrlFromEnv() {
  if (env.SQUIGLINK_APPLICATION_URL === undefined) throw new Error("APPLICATION_URL is not set");

  return env.SQUIGLINK_APPLICATION_URL;
}

function getResendApiKeyFromEnv() {
  if (env.SQUIGLINK_RESEND_API_KEY === undefined) throw new Error("RESEND_API_KEY is not set");

  return env.SQUIGLINK_RESEND_API_KEY;
}

async function getUserByEmail(email: string): Promise<Selectable<Users> | undefined> {
  return await database
    .selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .limit(1)
    .executeTakeFirst();
}
