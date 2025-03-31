import { database } from "../database.js";
import { Hono } from "hono";

const application = new Hono();

application.get("/models/:id/measurements", async (context) => {
  const id = context.req.param("id");

  const result = await database
    .selectFrom("measurements")
    .selectAll("measurements")
    .where("model_id", "=", id)
    .orderBy("measurements.created_at")
    .execute();

  return context.json(result);
});

export default application;
