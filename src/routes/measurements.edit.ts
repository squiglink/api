import { database, touch } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation_middleware.js";
import { verifyDatabaseUser } from "../services/verify_database_user.js";
import zod from "zod";

const application = new Hono<{
  Variables: {
    bodyParameters: zod.infer<typeof bodySchema>;
    pathParameters: zod.infer<typeof pathSchema>;
  };
}>();

const bodySchema = zod.object({
  database_id: zod.string().optional(),
  kind: zod
    .enum(["frequency_response", "harmonic_distortion", "impedance", "sound_isolation"])
    .optional(),
  label: zod.string().optional(),
  left_channel: zod.string().optional(),
  model_id: zod.string().optional(),
  right_channel: zod.string().optional(),
});

const pathSchema = zod.object({
  id: zod.string(),
});

application.patch(
  "/measurements/:id",
  validationMiddleware({ bodySchema, pathSchema }),
  async (context) => {
    const bodyParameters = context.get("bodyParameters");
    const pathParameters = context.get("pathParameters");

    const measurement = await database
      .selectFrom("measurements")
      .select("database_id")
      .where("id", "=", pathParameters.id)
      .executeTakeFirst();
    if (!measurement) return context.body(null, 404);
    if (
      !(await verifyDatabaseUser(
        context.var.currentUser.id,
        database,
        bodyParameters.database_id || measurement.database_id,
      ))
    ) {
      return context.body(null, 401);
    }

    const result = await database
      .updateTable("measurements")
      .set(bodyParameters)
      .set(touch)
      .where("id", "=", pathParameters.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return context.json(result);
  },
);

export default application;
