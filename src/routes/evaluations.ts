import { database } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation.js";
import zod from "zod";

const application = new Hono<{
  Variables: { queryParameters: zod.infer<typeof querySchema> };
}>();

const querySchema = zod.object({
  model_id: zod.string(),
  user_id: zod.string(),
});

application.get("/evaluations", validationMiddleware({ querySchema }), async (context) => {
  const queryParameters = context.get("queryParameters");

  const evaluation = await database
    .selectFrom("evaluations")
    .selectAll()
    .where("model_id", "=", queryParameters.model_id)
    .where("user_id", "=", queryParameters.user_id)
    .orderBy("evaluations.created_at")
    .executeTakeFirst();
  if (!evaluation) return context.body(null, 404);

  return context.json(evaluation);
});

export default application;
