import { serve } from "@hono/node-server";
import application from "./application.js";

serve({
  fetch: application.fetch,
  hostname: "0.0.0.0",
});
