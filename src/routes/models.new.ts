import { database } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation.js";
import zod from "zod";

const application = new Hono<{
  Variables: { jsonParameters: zod.infer<typeof bodySchema> };
}>();

const bodySchema = zod.object({
  brand_id: zod.string(),
  name: zod.string(),
});

application.post("/models/new", validationMiddleware({ bodySchema }), async (context) => {
  const jsonParameters = context.get("jsonParameters");

  const result = await database
    .insertInto("models")
    .values({ brand_id: jsonParameters.brand_id, name: jsonParameters.name })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
