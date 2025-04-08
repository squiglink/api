import { allowParameters } from "../services/allow_parameters.js";
import { database } from "../database.js";
import { Hono } from "hono";

const application = new Hono();

application.post("/brands/new", async (context) => {
  const body: { name: string } = allowParameters(await context.req.json(), ["name"]);

  const result = await database
    .insertInto("brands")
    .values({ name: body.name })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
