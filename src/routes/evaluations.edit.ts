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
  model_id: zod.string().optional(),
  review_score: zod.number().optional(),
  review_url: zod.string().optional(),
  shop_url: zod.string().optional(),
});

const pathSchema = zod.object({
  id: zod.string(),
});

application.patch(
  "/evaluations/:id",
  validationMiddleware({ bodySchema, pathSchema }),
  async (context) => {
    const bodyParameters = context.get("bodyParameters");
    const pathParameters = context.get("pathParameters");

    const result = await database
      .updateTable("evaluations")
      .set(bodyParameters)
      .set(touch)
      .where("id", "=", pathParameters.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return context.json(result);
  },
);

export default application;
