import { database } from "../database.js";
import { Hono } from "hono";

const application = new Hono();

application.get("/evaluations", async (context) => {
  const modelId = context.req.query("model_id");
  if (!modelId) return context.json({ error: "The model ID is not provided." }, 400);

  const userId = context.req.query("user_id");
  if (!userId) return context.json({ error: "The user ID is not provided." }, 400);

  const evaluation = await database
    .selectFrom("evaluations")
    .selectAll()
    .where("model_id", "=", modelId)
    .where("user_id", "=", userId)
    .orderBy("evaluations.created_at")
    .executeTakeFirst();
  if (!evaluation) return context.body(null, 404);

  return context.json(evaluation);
});

export default application;
