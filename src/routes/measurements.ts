import { database } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation_middleware.js";
import zod from "zod";

const application = new Hono<{
  Variables: { queryParameters: zod.infer<typeof querySchema> };
}>();

const querySchema = zod.object({
  database_id: zod.string(),
  model_id: zod.string(),
});

application.get("/measurements", validationMiddleware({ querySchema }), async (context) => {
  const queryParameters = context.get("queryParameters");

  const result = await database
    .selectFrom("measurements")
    .select(["created_at", "database_id", "id", "kind", "label", "model_id", "updated_at"])
    .where("database_id", "=", queryParameters.database_id)
    .where("model_id", "=", queryParameters.model_id)
    .orderBy("measurements.created_at")
    .execute();

  return context.json(result);
});

export default application;
