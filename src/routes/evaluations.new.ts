import { database } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation_middleware.js";
import zod from "zod";

const application = new Hono<{
  Variables: {
    jsonParameters: zod.infer<typeof bodySchema>;
  };
}>();

const bodySchema = zod.object({
  model_id: zod.string(),
  review_score: zod.number().optional(),
  review_url: zod.string().optional(),
  shop_url: zod.string().optional(),
});

application.post("/evaluations/new", validationMiddleware({ bodySchema }), async (context) => {
  const jsonParameters = context.get("jsonParameters");

  const evaluation = await database
    .selectFrom("evaluations")
    .where("model_id", "=", jsonParameters.model_id)
    .where("user_id", "=", context.var.currentUser.id)
    .executeTakeFirst();
  if (evaluation) {
    return context.body(null, 409);
  }

  const result = await database
    .insertInto("evaluations")
    .values({
      model_id: jsonParameters.model_id,
      review_score: jsonParameters.review_score,
      review_url: jsonParameters.review_url,
      shop_url: jsonParameters.shop_url,
      user_id: context.var.currentUser.id,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
