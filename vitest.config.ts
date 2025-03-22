import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    fileParallelism: false,
    setupFiles: ["src/test_helper.ts"],
    env: {
      SQUIGLINK_APPLICATION_ENVIRONMENT: "test",
    },
  },
});
