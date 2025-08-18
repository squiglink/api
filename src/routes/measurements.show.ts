import { database } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation.js";
import zod from "zod";

const application = new Hono<{
  Variables: { pathParameters: zod.infer<typeof pathSchema> };
}>();

const pathSchema = zod.object({
  id: zod.string(),
});

application.get("/measurements/:id", validationMiddleware({ pathSchema }), async (context) => {
  const pathParameters = context.get("pathParameters");

  const result = await database
    .selectFrom("measurements")
    .selectAll()
    .where("id", "=", pathParameters.id)
    .orderBy("measurements.created_at")
    .executeTakeFirst();
  if (!result) return context.body(null, 404);

  return context.json(result);
});

export default application;
