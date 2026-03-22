import application from "../application.js";
import configuration from "../configuration.js";

export default function start() {
  Bun.serve({
    fetch: application.fetch,
    hostname: "0.0.0.0",
    port: configuration.serverPort,
  });
}
