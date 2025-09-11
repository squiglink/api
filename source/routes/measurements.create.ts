import { database } from "../database.js";
import { Hono } from "hono";
import { parseMeasurement } from "../services/parse_measurement.js";
import { validationMiddleware } from "../middlewares/validation_middleware.js";
import { verifyDatabaseUser } from "../services/verify_database_user.js";
import zod from "zod";

const application = new Hono<{
  Variables: {
    bodyParameters: zod.infer<typeof bodySchema>;
    currentUser: { id: string };
  };
}>();

const bodySchema = zod.object({
  database_id: zod.string(),
  kind: zod.enum(["frequency_response", "harmonic_distortion", "impedance", "sound_isolation"]),
  label: zod.string(),
  left_channel: zod.string(),
  model_id: zod.string(),
  right_channel: zod.string(),
});

application.post("/measurements", validationMiddleware({ bodySchema }), async (context) => {
  const bodyParameters = context.get("bodyParameters");

  if (
    !(await verifyDatabaseUser(context.get("currentUser").id, database, bodyParameters.database_id))
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
    const [rightChannelParsed, rightChannelError] = parseMeasurement(bodyParameters.right_channel);
    if (rightChannelError) return context.json({ error: rightChannelError }, 400);
    channels.right_channel = rightChannelParsed;
  }

  const result = await database
    .insertInto("measurements")
    .values({ ...bodyParameters, ...channels })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
