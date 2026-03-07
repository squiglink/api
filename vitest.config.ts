import configuration from "./source/configuration.js";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      SQUIGLINK_CLOUDFLARE_TURNSTILE_ENABLED: "false",
      SQUIGLINK_CLOUDFLARE_TURNSTILE_SECRET: "placeholder",
      SQUIGLINK_POSTGRES_DATABASE: configuration.postgresTestDatabase,
      SQUIGLINK_SERVER_ENVIRONMENT: "test",
    },
    fileParallelism: false,
    setupFiles: ["source/test_helper.ts"],
  },
});
