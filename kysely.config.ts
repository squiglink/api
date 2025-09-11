import { defineConfig } from "kysely-ctl";
import { database } from "./source/database.js";

export default defineConfig({
  kysely: database,
});
