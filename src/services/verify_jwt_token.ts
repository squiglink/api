import { env } from "process";
import { verify } from "hono/jwt";

export async function verifyJwtToken(token: string) {
  try {
    const payload = await verify(token, getJwtSecretFromEnv());

    if (payload.expiresIn) {
      const expirationDate = new Date((payload.exp as number) * 1000);
      const currentDate = new Date();

      if (expirationDate < currentDate) {
        return null;
      }
    }

    return payload;
  } catch (error) {
    console.log("[verifyJwtToken] error: ", error);
    return null;
  }
}

function getJwtSecretFromEnv() {
  if (env.SQUIGLINK_JWT_SECRET === undefined) throw new Error("JWT_SECRET is not set");

  return env.SQUIGLINK_JWT_SECRET;
}
