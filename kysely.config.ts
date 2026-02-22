import { defineConfig } from "kysely-ctl";
import { join } from "path";

const environment = process.env.SQUIGLINK_API_ENVIRONMENT;

const { database } = await import(
  environment === "production" ? "./output/source/database.js" : "./source/database.js"
);

export default defineConfig({
  kysely: database,
  migrations: {
    allowJS: environment === "production",
    migrationFolder:
      environment === "production"
        ? join(import.meta.dirname, "output", "migrations")
        : join(import.meta.dirname, "migrations"),
  },
});
