import { Hono } from "hono";

const application = new Hono();

application.get("/health", (context) => {
  return context.body(null, 200);
});

export default application;
