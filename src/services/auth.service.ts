import { sign, verify } from "hono/jwt";
import { Resend } from "resend";
import { database } from "../database.js";

const AUTH_EMAIL = process.env.SQUIGLINK_AUTHENTICATION_EMAIL as string;
const APP_URL = process.env.SQUIGLINK_APPLICATION_URL as string;
const JWT_SECRET = process.env.SQUIGLINK_JWT_SECRET as string;
const RESEND_API_KEY = process.env.SQUIGLINK_RESEND_API_KEY as string;

const resend = new Resend(RESEND_API_KEY);

export class AuthService {
  static async createLoginToken(email: string): Promise<string> {
    const token = await sign({ email }, JWT_SECRET);
    return token;
  }

  static async sendMagicLink(email: string): Promise<string> {
    const token = await this.createLoginToken(email);
    const magicLink = `${APP_URL}/auth/verify?token=${token}`;

    await resend.emails.send({
      from: AUTH_EMAIL,
      to: email,
      subject: "Your Magic Link",
      html: `Click here to login: <a href="${magicLink}">${magicLink}</a>`,
    });

    return magicLink;
  }

  static async verifyToken(token: string) {
    try {
      const payload = await verify(token, JWT_SECRET);
      const user = await database
        .selectFrom("users")
        .selectAll()
        .where("email", "=", payload.email as string)
        .executeTakeFirst();

      return user;
    } catch {
      return null;
    }
  }
}
