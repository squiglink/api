import { env } from "process";

const database = envString("SQUIGLINK_POSTGRES_DATABASE");
const host = envString("SQUIGLINK_POSTGRES_HOST");
const password = envString("SQUIGLINK_POSTGRES_PASSWORD");
const user = envString("SQUIGLINK_POSTGRES_USER");

function envString(key: string): string {
  if (env[key] === undefined) throw new Error(`\`${key}\` is not set.`);
  return env[key];
}

export default {
  outFile: "source/types.ts",
  url: `postgres://${user}:${password}@${host}/${database}`,
};
