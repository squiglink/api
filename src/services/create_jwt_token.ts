import { env } from "process";
import { sign } from "hono/jwt";

export async function createJwtToken(expiresIn: number): Promise<string> {
  const currentDate = new Date();
  let expirationDate: Date;

  expirationDate = new Date(expiresIn);

  if (expirationDate < currentDate) {
    throw new Error("Expiration date must be in the future");
  }

  const token = await sign(
    {
      iat: Math.floor(currentDate.getTime() / 1000),
      exp: Math.floor(expirationDate.getTime() / 1000),
    },
    getJwtSecretFromEnv(),
  );

  return token;
}

function getJwtSecretFromEnv() {
  if (env.SQUIGLINK_JWT_SECRET === undefined) {
    throw new Error("JWT_SECRET is not set");
  }

  return env.SQUIGLINK_JWT_SECRET;
}
