import application from "./application.js";
import configuration from "./configuration.js";

Bun.serve({
  fetch: application.fetch,
  hostname: "0.0.0.0",
  port: configuration.serverPort,
});
