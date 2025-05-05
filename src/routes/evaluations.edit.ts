import { allowParameters } from "../services/allow_parameters.js";
import { database, touch } from "../database.js";
import { Hono } from "hono";

const application = new Hono();

application.patch("/evaluations/:id/edit", async (context) => {
  const body: {
    model_id?: string;
    review_score?: number;
    review_url?: string;
    shop_url?: string;
  } = allowParameters(await context.req.json(), [
    "model_id",
    "review_score",
    "review_url",
    "shop_url",
  ]);
  const id = context.req.param("id");

  const result = await database
    .updateTable("evaluations")
    .set(body)
    .set(touch)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
