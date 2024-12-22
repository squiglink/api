import { defineConfig } from "kysely-ctl";
import { newDialect } from "./src/database.js";

export default defineConfig({
  dialect: newDialect(),
});
