import { database } from "../database.js";
import { Hono } from "hono";
import { verifyDatabaseUser } from "../services/verify_database_user.js";
import type { MeasurementKind } from "../types.js";

const application = new Hono();

application.post("/measurements/new", async (context) => {
  const body: {
    database_id: string;
    kind: MeasurementKind;
    label: string;
    left_channel: string;
    model_id: string;
    right_channel: string;
  } = await context.req.json();

  if (!(await verifyDatabaseUser(context.var.currentUser.id, database, body.database_id))) {
    return context.body(null, 401);
  }

  const result = await database
    .insertInto("measurements")
    .values({
      database_id: body.database_id,
      kind: body.kind,
      label: body.label,
      left_channel: body.left_channel,
      model_id: body.model_id,
      right_channel: body.right_channel,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
