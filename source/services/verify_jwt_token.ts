import { verify } from "hono/jwt";
import configuration from "../configuration.js";

export async function verifyJwtToken(token: string) {
  try {
    const payload = await verify(token, configuration.jwtSecret, "HS256");

    if (payload.expiresIn) {
      const expirationDate = new Date((payload.exp as number) * 1000);
      const currentDate = new Date();

      if (expirationDate < currentDate) {
        return null;
      }
    }

    return payload;
  } catch {
    return null;
  }
}
