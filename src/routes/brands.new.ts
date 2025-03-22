import { database } from "../database.js";
import { Hono } from "hono";

const application = new Hono();

application.post("/", async (context) => {
  const body = await context.req.json();

  const result = await database
    .insertInto("brands")
    .values({
      name: body.name,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
