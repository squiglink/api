import { database } from "../database.js";
import { Hono } from "hono";
import type { MeasurementKind } from "../types.js";

const application = new Hono();

application.post("/measurements/new", async (context) => {
  const body: {
    database_id: string;
    kind: MeasurementKind;
    label?: string;
    left_channel: string;
    model_id: string;
    right_channel: string;
  } = await context.req.json();

  const currentUserId = context.var.currentUser.id;
  const databaseUserId = (
    await database
      .selectFrom("databases")
      .select("user_id")
      .where("id", "=", body.database_id)
      .executeTakeFirstOrThrow()
  ).user_id;
  if (currentUserId != databaseUserId) return context.body(null, 401);

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
