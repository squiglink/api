import { database, touch } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation.js";
import zod from "zod";

const application = new Hono<{
  Variables: {
    jsonParameters: zod.infer<typeof bodySchema>;
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
  "/evaluations/:id/edit",
  validationMiddleware({ bodySchema, pathSchema }),
  async (context) => {
    const jsonParameters = context.get("jsonParameters");
    const pathParameters = context.get("pathParameters");

    const result = await database
      .updateTable("evaluations")
      .set(jsonParameters)
      .set(touch)
      .where("id", "=", pathParameters.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return context.json(result);
  },
);

export default application;
