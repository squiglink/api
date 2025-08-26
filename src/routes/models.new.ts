import { database } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation_middleware.js";
import zod from "zod";

const application = new Hono<{
  Variables: { bodyParameters: zod.infer<typeof bodySchema> };
}>();

const bodySchema = zod.object({
  brand_id: zod.string(),
  name: zod.string(),
});

application.post("/models/new", validationMiddleware({ bodySchema }), async (context) => {
  const bodyParameters = context.get("bodyParameters");

  const result = await database
    .insertInto("models")
    .values(bodyParameters)
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
