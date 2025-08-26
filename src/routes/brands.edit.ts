import { database, touch } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation_middleware.js";
import zod from "zod";

const application = new Hono<{
  Variables: {
    bodyParameters: zod.infer<typeof bodySchema>;
    pathParameters: zod.infer<typeof pathSchema>;
  };
}>();

const bodySchema = zod.object({
  name: zod.string().optional(),
});

const pathSchema = zod.object({
  id: zod.string(),
});

application.patch(
  "/brands/:id",
  validationMiddleware({ bodySchema, pathSchema }),
  async (context) => {
    const bodyParameters = context.get("bodyParameters");
    const pathParameters = context.get("pathParameters");

    const result = await database
      .updateTable("brands")
      .set(bodyParameters)
      .set(touch)
      .where("id", "=", pathParameters.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return context.json(result);
  },
);

export default application;
