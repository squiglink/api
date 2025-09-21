import { database } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation_middleware.js";
import { verifyDatabaseUser } from "../services/verify_database_user.js";
import zod from "zod";

const application = new Hono<{
  Variables: {
    currentUser: { id: string };
    pathParameters: zod.infer<typeof pathSchema>;
  };
}>();

const pathSchema = zod.object({
  id: zod.uuid(),
});

application.delete("/measurements/:id", validationMiddleware({ pathSchema }), async (context) => {
  const pathParameters = context.get("pathParameters");

  const measurement = await database
    .selectFrom("measurements")
    .select("database_id")
    .where("id", "=", pathParameters.id)
    .executeTakeFirst();
  if (!measurement) return context.body(null, 404);

  if (
    !(await verifyDatabaseUser(context.get("currentUser").id, database, measurement.database_id))
  ) {
    return context.body(null, 401);
  }

  await database.deleteFrom("measurements").where("id", "=", pathParameters.id).execute();

  return context.body(null, 200);
});

export default application;
