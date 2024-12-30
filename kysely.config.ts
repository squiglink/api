import { defineConfig } from "kysely-ctl";
import { database } from "./src/database.js";

export default defineConfig({
  kysely: database,
});
