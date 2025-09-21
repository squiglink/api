import { sign } from "hono/jwt";
import configuration from "../configuration.js";

export async function createJwtToken(expiresIn: number): Promise<string> {
  const currentDate = new Date();
  const expirationDate = new Date(currentDate.getTime() + expiresIn);

  if (expirationDate < currentDate) {
    throw new Error("Expiration date must be in the future");
  }

  const token = await sign(
    {
      iat: Math.floor(currentDate.getTime() / 1000),
      exp: Math.floor(expirationDate.getTime() / 1000),
    },
    configuration.jwtSecret,
  );

  return token;
}
