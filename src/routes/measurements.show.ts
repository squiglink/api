import { database } from "../database.js";
import { Hono } from "hono";

const application = new Hono();

application.get("/measurements/:id", async (context) => {
  const result = await database
    .selectFrom("measurements")
    .selectAll()
    .where("id", "=", context.req.param("id"))
    .orderBy("measurements.created_at")
    .executeTakeFirst();
  if (!result) return context.body(null, 404);

  return context.json(result);
});

export default application;
