import { allowParameters } from "../services/allow_parameters.js";
import { database } from "../database.js";
import { Hono } from "hono";

const application = new Hono();

application.post("/models/new", async (context) => {
  const body: {
    brand_id: string;
    name: string;
  } = allowParameters(await context.req.json(), ["brand_id", "name"]);

  const result = await database
    .insertInto("models")
    .values({ brand_id: body.brand_id, name: body.name })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
