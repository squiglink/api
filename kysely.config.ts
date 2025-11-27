import { defineConfig } from "kysely-ctl";

const { database } = await import(
  process.env.SQUIGLINK_API_ENVIRONMENT === "production"
    ? "./output/database.js"
    : "./source/database.js"
);

export default defineConfig({
  kysely: database,
});
