import { database } from "../database.js";
import { Hono } from "hono";

const application = new Hono();

application.post("/models/new", async (context) => {
  const body: {
    brand_id: string;
    name: string;
  } = await context.req.json();

  const result = await database
    .insertInto("models")
    .values({
      brand_id: body.brand_id,
      name: body.name,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
