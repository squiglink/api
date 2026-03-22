import { defineConfig } from "kysely-ctl";
import { join } from "path";

const { database } = await import("./source/database.js");

export default defineConfig({
  kysely: database,
  migrations: {
    migrationFolder: join(import.meta.dirname, "migrations"),
  },
});
