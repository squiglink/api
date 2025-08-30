import { database } from "../database.js";
import { Hono } from "hono";
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

  const result = await database
    .insertInto("measurements")
    .values(bodyParameters)
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
