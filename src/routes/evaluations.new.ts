import { allowParameters } from "../services/allow_parameters.js";
import { database } from "../database.js";
import { Hono } from "hono";

const application = new Hono();

application.post("/evaluations/new", async (context) => {
  const body: {
    model_id: string;
    review_score?: number;
    review_url?: string;
    shop_url?: string;
  } = allowParameters(await context.req.json(), [
    "model_id",
    "review_score",
    "review_url",
    "shop_url",
  ]);

  const evaluation = await database
    .selectFrom("evaluations")
    .where("model_id", "=", body.model_id)
    .where("user_id", "=", context.var.currentUser.id)
    .executeTakeFirst();
  if (evaluation) {
    return context.json({ error: "An evaluation for the model already exists." }, 400);
  }

  const result = await database
    .insertInto("evaluations")
    .values({
      model_id: body.model_id,
      review_score: body.review_score,
      review_url: body.review_url,
      shop_url: body.shop_url,
      user_id: context.var.currentUser.id,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
