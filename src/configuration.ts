import { env } from "process";

interface Configuration {
  accessTokenExpirationTime: number;
  applicationUrl: string;
  emailFrom: string;
  jwtSignature: string;
  magicLinkTokenExpirationTime: number;
  postgresDatabase: string;
  postgresHost: string;
  postgresPassword: string;
  postgresTestDatabase: string;
  postgresUser: string;
  refreshTokenExpirationTime: number;
  resendApiKey: string;
}

let configuration: Configuration = {
  accessTokenExpirationTime: envNumber("SQUIGLINK_ACCESS_TOKEN_EXPIRATION_TIME"),
  applicationUrl: envString("SQUIGLINK_APPLICATION_URL"),
  emailFrom: envString("SQUIGLINK_EMAIL_FROM"),
  jwtSignature: envString("SQUIGLINK_JWT_SIGNATURE"),
  magicLinkTokenExpirationTime: envNumber("SQUIGLINK_MAGIC_LINK_TOKEN_EXPIRATION_TIME"),
  postgresDatabase: envString("SQUIGLINK_POSTGRES_DATABASE"),
  postgresHost: envString("SQUIGLINK_POSTGRES_HOST"),
  postgresPassword: envString("SQUIGLINK_POSTGRES_PASSWORD"),
  postgresTestDatabase: envString("SQUIGLINK_POSTGRES_TEST_DATABASE"),
  postgresUser: envString("SQUIGLINK_POSTGRES_USER"),
  refreshTokenExpirationTime: envNumber("SQUIGLINK_REFRESH_TOKEN_EXPIRATION_TIME"),
  resendApiKey: envString("SQUIGLINK_RESEND_API_KEY"),
};

function envNumber(key: string): number {
  return Number(envString(key));
}

function envString(key: string): string {
  if (env[key] === undefined) throw new Error(`\`${key}\` is not set.`);
  return env[key];
}

export default configuration;
