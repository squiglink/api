import { env } from "process";

interface Configuration {
  postgresDatabase: string;
  postgresHost: string;
  postgresPassword: string;
  postgresTestDatabase: string;
  postgresUser: string;
}

let configuration: Configuration = {
  postgresDatabase: envString("SQUIGLINK_POSTGRES_DATABASE"),
  postgresHost: envString("SQUIGLINK_POSTGRES_HOST"),
  postgresPassword: envString("SQUIGLINK_POSTGRES_PASSWORD"),
  postgresTestDatabase: envString("SQUIGLINK_POSTGRES_TEST_DATABASE"),
  postgresUser: envString("SQUIGLINK_POSTGRES_USER"),
};

function envString(key: string): string {
  if (env[key] === undefined) throw new Error(`\`${key}\` is not set.`);
  return env[key];
}

export default configuration;
