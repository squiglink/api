import { database, touch } from "../database.js";
import { Hono } from "hono";
import { parseMeasurement } from "../services/parse_measurement.js";
import { validationMiddleware } from "../middlewares/validation_middleware.js";
import { verifyDatabaseUser } from "../services/verify_database_user.js";
import zod from "zod";

const application = new Hono<{
  Variables: {
    bodyParameters: zod.infer<typeof bodySchema>;
    currentUser: { id: string };
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
        context.get("currentUser").id,
        database,
        bodyParameters.database_id || measurement.database_id,
      ))
    ) {
      return context.body(null, 401);
    }

    let channels: { left_channel?: string; right_channel?: string } = {};
    if (bodyParameters.left_channel) {
      const [leftChannelParsed, leftChannelError] = parseMeasurement(bodyParameters.left_channel);
      if (leftChannelError) return context.json({ error: leftChannelError }, 400);
      channels.left_channel = leftChannelParsed;
    }
    if (bodyParameters.right_channel) {
      const [rightChannelParsed, rightChannelError] = parseMeasurement(
        bodyParameters.right_channel,
      );
      if (rightChannelError) return context.json({ error: rightChannelError }, 400);
      channels.right_channel = rightChannelParsed;
    }

    const result = await database
      .updateTable("measurements")
      .set({ ...bodyParameters, ...channels })
      .set(touch)
      .where("id", "=", pathParameters.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return context.json(result);
  },
);

export default application;
