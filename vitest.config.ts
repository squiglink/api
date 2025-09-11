import { defineConfig } from "vitest/config";
import configuration from "./source/configuration.js";

export default defineConfig({
  test: {
    env: {
      SQUIGLINK_API_ENVIRONMENT: "test",
      SQUIGLINK_POSTGRES_DATABASE: configuration.postgresTestDatabase,
    },
    fileParallelism: false,
    setupFiles: ["source/test_helper.ts"],
  },
});
