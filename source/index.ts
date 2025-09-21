import application from "./application.js";
import configuration from "./configuration.js";
import { serve } from "@hono/node-server";

serve({
  fetch: application.fetch,
  hostname: "0.0.0.0",
  port: configuration.apiPort,
});
