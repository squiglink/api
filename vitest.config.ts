import { defineConfig } from "vitest/config";
import configuration from "./src/configuration.js";

export default defineConfig({
  test: {
    env: {
      SQUIGLINK_POSTGRES_DATABASE: configuration.postgresTestDatabase,
    },
    fileParallelism: false,
    setupFiles: ["src/test_helper.ts"],
    env: {
      SQUIGLINK_APPLICATION_ENVIRONMENT: "test",
      SQUIGLINK_POSTGRES_DATABASE: configuration.postgresTestDatabase,
    },
  },
});
