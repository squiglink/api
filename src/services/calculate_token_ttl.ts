import { env } from "process";

export function calculateTokenTTL(tokenTTL: number): number {
  return Date.now() + tokenTTL * 1000;
}

export function getEmailAuthTokenTTL(): number {
  if (env.SQUIGLINK_EMAIL_AUTH_TOKEN_TTL === undefined) {
    throw new Error("EMAIL_AUTH_TOKEN_TTL is not set");
  }

  return Number(env.SQUIGLINK_EMAIL_AUTH_TOKEN_TTL);
}

export function getAccessTokenTTL(): number {
  if (env.SQUIGLINK_ACCESS_TOKEN_TTL === undefined) {
    throw new Error("ACCESS_TOKEN_TTL is not set");
  }

  return Number(env.SQUIGLINK_ACCESS_TOKEN_TTL);
}

export function getRefreshTokenTTL(): number {
  if (env.SQUIGLINK_REFRESH_TOKEN_TTL === undefined) {
    throw new Error("REFRESH_TOKEN_TTL is not set");
  }

  return Number(env.SQUIGLINK_REFRESH_TOKEN_TTL);
}
