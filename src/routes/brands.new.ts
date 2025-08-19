import { database } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation_middleware.js";
import zod from "zod";

const application = new Hono<{
  Variables: { bodyParameters: zod.infer<typeof bodySchema> };
}>();

const bodySchema = zod.object({
  name: zod.string(),
});

application.post("/brands/new", validationMiddleware({ bodySchema }), async (context) => {
  const bodyParameters = context.get("bodyParameters");

  const result = await database
    .insertInto("brands")
    .values({ name: bodyParameters.name })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
