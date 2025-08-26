import { database } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation_middleware.js";
import zod from "zod";

const application = new Hono<{
  Variables: {
    bodyParameters: zod.infer<typeof bodySchema>;
  };
}>();

const bodySchema = zod.object({
  model_id: zod.string(),
  review_score: zod.number().optional(),
  review_url: zod.string().optional(),
  shop_url: zod.string().optional(),
});

application.post("/evaluations/new", validationMiddleware({ bodySchema }), async (context) => {
  const bodyParameters = context.get("bodyParameters");

  const evaluation = await database
    .selectFrom("evaluations")
    .where("model_id", "=", bodyParameters.model_id)
    .where("user_id", "=", context.var.currentUser.id)
    .executeTakeFirst();
  if (evaluation) {
    return context.body(null, 409);
  }

  const result = await database
    .insertInto("evaluations")
    .values({ ...bodyParameters, user_id: context.var.currentUser.id })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
