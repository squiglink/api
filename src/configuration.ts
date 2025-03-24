import { env } from "process";

interface Configuration {
  apiKeyResend: string;
  applicationEnvironment: string;
  applicationUrl: string;
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
}

let configuration: Configuration = {
  apiKeyResend: envString("SQUIGLINK_API_KEY_RESEND"),
  applicationEnvironment: envString("SQUIGLINK_APPLICATION_ENVIRONMENT"),
  applicationUrl: envString("SQUIGLINK_APPLICATION_URL"),
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
};

function envNumber(key: string): number {
  return Number(envString(key));
}

function envString(key: string): string {
  if (env[key] === undefined) throw new Error(`\`${key}\` is not set.`);
  return env[key];
}

export default configuration;
