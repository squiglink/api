import { database } from "../database.js";
import { Hono } from "hono";

const application = new Hono();

application.get("/measurements", async (context) => {
  const databaseId = context.req.query("database_id");
  if (!databaseId) return context.json({ error: "The database ID is not provided." }, 400);
  const modelId = context.req.query("model_id");
  if (!modelId) return context.json({ error: "The model ID is not provided." }, 400);

  const result = await database
    .selectFrom("measurements")
    .select(["created_at", "database_id", "id", "kind", "label", "model_id", "updated_at"])
    .where("database_id", "=", databaseId)
    .where("model_id", "=", modelId)
    .orderBy("measurements.created_at")
    .execute();

  return context.json(result);
});

export default application;
