import { database } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation.js";
import { verifyDatabaseUser } from "../services/verify_database_user.js";
import zod from "zod";

const application = new Hono<{
  Variables: {
    jsonParameters: zod.infer<typeof bodySchema>;
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

application.post("/measurements/new", validationMiddleware({ bodySchema }), async (context) => {
  const jsonParameters = context.get("jsonParameters");

  if (
    !(await verifyDatabaseUser(context.var.currentUser.id, database, jsonParameters.database_id))
  ) {
    return context.body(null, 401);
  }

  const result = await database
    .insertInto("measurements")
    .values({
      database_id: jsonParameters.database_id,
      kind: jsonParameters.kind,
      label: jsonParameters.label,
      left_channel: jsonParameters.left_channel,
      model_id: jsonParameters.model_id,
      right_channel: jsonParameters.right_channel,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
