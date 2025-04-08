import { allowParameters } from "../services/allow_parameters.js";
import { database, touch } from "../database.js";
import { Hono } from "hono";
import { verifyDatabaseUser } from "../services/verify_database_user.js";
import type { MeasurementKind } from "../types.js";

const application = new Hono();

application.patch("/measurements/:id/edit", async (context) => {
  const body: {
    database_id?: string;
    kind?: MeasurementKind;
    label?: string;
    left_channel?: string;
    model_id: string;
    right_channel?: string;
  } = allowParameters(await context.req.json(), [
    "database_id",
    "kind",
    "label",
    "left_channel",
    "model_id",
    "right_channel",
  ]);
  const id = context.req.param("id");

  const measurement = await database
    .selectFrom("measurements")
    .select("database_id")
    .where("id", "=", id)
    .executeTakeFirst();
  if (!measurement) return context.body(null, 404);
  if (
    !(await verifyDatabaseUser(
      context.var.currentUser.id,
      database,
      body.database_id || measurement.database_id,
    ))
  ) {
    return context.body(null, 401);
  }

  const result = await database
    .updateTable("measurements")
    .set(body)
    .set(touch)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
