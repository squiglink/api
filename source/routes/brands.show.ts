import zod from "zod";
import { Hono } from "hono";
import { database } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";

const application = new Hono();

const paramSchema = zod.object({
  id: zod.string(),
});

const responseSchema = zod.object({
  created_at: zod.string(),
  id: zod.string(),
  model_count: zod.string(),
  name: zod.string(),
  updated_at: zod.string(),
});

const routeDescription = describeRoute({
  responses: {
    200: {
      content: {
        "application/json": {
          schema: resolver(responseSchema),
        },
      },
      description: "OK",
    },
    404: { description: "Not Found" },
  },
});

application.get(
  "/brands/:id",
  routeDescription,
  validator("param", paramSchema),
  async (context) => {
    const paramParameters = context.req.valid("param");

    const result = await database
      .selectFrom("brands")
      .leftJoin("models", "brands.id", "models.brand_id")
      .selectAll("brands")
      .select(database.fn.count("models.id").as("model_count"))
      .where("brands.id", "=", paramParameters.id)
      .groupBy("brands.id")
      .executeTakeFirst();
    if (!result) return context.body(null, 404);

    return context.json(result);
  },
);

export default application;
