import zod from "zod";
import { Hono } from "hono";
import { database } from "../database.js";
import { describeRoute, validator } from "hono-openapi";
import { verifyDatabaseUser } from "../services/verify_database_user.js";

const application = new Hono<{
  Variables: {
    currentUser: { id: string };
  };
}>();

const paramSchema = zod.object({
  id: zod.uuid(),
});

const routeDescription = describeRoute({
  responses: {
    200: { description: "OK" },
    401: { description: "Unauthorized" },
    404: { description: "Not Found" },
  },
});

application.delete(
  "/measurements/:id",
  routeDescription,
  validator("param", paramSchema),
  async (context) => {
    const paramParameters = context.req.valid("param");

    const measurement = await database
      .selectFrom("measurements")
      .select("database_id")
      .where("id", "=", paramParameters.id)
      .executeTakeFirst();
    if (!measurement) return context.body(null, 404);

    if (
      !(await verifyDatabaseUser(context.get("currentUser").id, database, measurement.database_id))
    ) {
      return context.body(null, 401);
    }

    await database.deleteFrom("measurements").where("id", "=", paramParameters.id).execute();

    return context.body(null, 200);
  },
);

export default application;
