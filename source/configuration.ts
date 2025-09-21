import { env } from "process";

interface Configuration {
  apiEnvironment: string;
  apiUrl: string;
  cloudflareTurnstileEnabled: boolean;
  cloudflareTurnstileSecret: string;
  emailFrom: string;
  jwtExpirationTimeAccessToken: number;
  jwtExpirationTimeMagicLinkToken: number;
  jwtExpirationTimeRefreshToken: number;
  jwtSecret: string;
  postgresDatabase: string;
  postgresHost: string;
  postgresPassword: string;
  postgresTestDatabase: string;
  postgresUser: string;
  resendApiKey: string;
  studioUrl: string;
}

const configuration: Configuration = {
  apiEnvironment: envString("SQUIGLINK_API_ENVIRONMENT"),
  apiUrl: envString("SQUIGLINK_API_URL"),
  cloudflareTurnstileEnabled: envBoolean("SQUIGLINK_CLOUDFLARE_TURNSTILE_ENABLED"),
  cloudflareTurnstileSecret: envString("SQUIGLINK_CLOUDFLARE_TURNSTILE_SECRET"),
  emailFrom: envString("SQUIGLINK_EMAIL_FROM"),
  jwtExpirationTimeAccessToken: envNumber("SQUIGLINK_JWT_EXPIRATION_TIME_ACCESS_TOKEN"),
  jwtExpirationTimeMagicLinkToken: envNumber("SQUIGLINK_JWT_EXPIRATION_TIME_MAGIC_LINK_TOKEN"),
  jwtExpirationTimeRefreshToken: envNumber("SQUIGLINK_JWT_EXPIRATION_TIME_REFRESH_TOKEN"),
  jwtSecret: envString("SQUIGLINK_JWT_SECRET"),
  postgresDatabase: envString("SQUIGLINK_POSTGRES_DATABASE"),
  postgresHost: envString("SQUIGLINK_POSTGRES_HOST"),
  postgresPassword: envString("SQUIGLINK_POSTGRES_PASSWORD"),
  postgresTestDatabase: envString("SQUIGLINK_POSTGRES_TEST_DATABASE"),
  postgresUser: envString("SQUIGLINK_POSTGRES_USER"),
  resendApiKey: envString("SQUIGLINK_RESEND_API_KEY"),
  studioUrl: envString("SQUIGLINK_STUDIO_URL"),
};

function envBoolean(key: string): boolean {
  if (env[key] === "false") return false;
  if (env[key] === "true") return true;
  if (env[key] === undefined) throw new Error(`\`${key}\` is not set.`);
  throw new Error(`\`${key}\` is not a boolean.`);
}

function envNumber(key: string): number {
  return Number(envString(key));
}

function envString(key: string): string {
  if (env[key] === undefined) throw new Error(`\`${key}\` is not set.`);
  return env[key];
}

export default configuration;
