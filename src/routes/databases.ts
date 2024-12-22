import { databaseMiddleware } from "../middlewares/database_middleware.js";
import { Hono } from "hono";

const application = new Hono();

application.get("/", databaseMiddleware, async (context) => {
  const databases = await context.var.database
    .selectFrom("databases")
    .selectAll()
    .limit(10)
    .offset((Number(context.req.query("page")) || 1) - 1)
    .execute();

  return context.json(databases);
});

export default application;
