import { databaseMiddleware } from "../middlewares/database_middleware.js";
import { Hono } from "hono";

const application = new Hono();

application.post("/new", databaseMiddleware, async (context) => {
  const body = await context.req.json();

  const result = await context.var.database
    .insertInto("brands")
    .values({
      name: body.name,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
