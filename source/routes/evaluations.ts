import zod from "zod";
import { Hono } from "hono";
import { database } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";

const application = new Hono();

const querySchema = zod.object({
  model_id: zod.string(),
  user_id: zod.string(),
});

const responseSchema = zod.object({
  created_at: zod.string(),
  id: zod.string(),
  model_id: zod.string(),
  review_score: zod.number().nullable(),
  review_url: zod.string().nullable(),
  shop_url: zod.string().nullable(),
  updated_at: zod.string(),
  user_id: zod.string(),
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
  "/evaluations",
  routeDescription,
  validator("query", querySchema),
  async (context) => {
    const queryParameters = context.req.valid("query");

    const evaluation = await database
      .selectFrom("evaluations")
      .selectAll()
      .where("model_id", "=", queryParameters.model_id)
      .where("user_id", "=", queryParameters.user_id)
      .orderBy("evaluations.created_at")
      .executeTakeFirst();
    if (!evaluation) return context.body(null, 404);

    return context.json(evaluation);
  },
);

export default application;
