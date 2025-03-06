import { env } from "process";

const database = env.SQUIGLINK_POSTGRES_DATABASE;
const host = env.SQUIGLINK_POSTGRES_HOST;
const password = env.SQUIGLINK_POSTGRES_PASSWORD;
const user = env.SQUIGLINK_POSTGRES_USER;

export default {
  outFile: "src/types.ts",
  url: `postgres://${user}:${password}@${host}/${database}`,
};
