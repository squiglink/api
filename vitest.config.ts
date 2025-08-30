import { defineConfig } from "vitest/config";
import configuration from "./src/configuration.js";

export default defineConfig({
  test: {
    env: {
      SQUIGLINK_API_ENVIRONMENT: "test",
      SQUIGLINK_CLOUDFLARE_TURNSTILE_ENABLED: "false",
      SQUIGLINK_CLOUDFLARE_TURNSTILE_SECRET: "placeholder",
      SQUIGLINK_POSTGRES_DATABASE: configuration.postgresTestDatabase,
      SQUIGLINK_RESEND_API_KEY: "placeholder",
    },
    fileParallelism: false,
    setupFiles: ["src/test_helper.ts"],
  },
});
