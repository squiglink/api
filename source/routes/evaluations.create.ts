import zod from "zod";
import { Hono } from "hono";
import { database } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";

const application = new Hono<{
  Variables: {
    currentUser: { id: string };
  };
}>();

const jsonSchema = zod.object({
  model_id: zod.string(),
  review_score: zod.number().optional(),
  review_url: zod.string().optional(),
  shop_url: zod.string().optional(),
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
    409: { description: "Conflict" },
  },
});

application.post(
  "/evaluations",
  routeDescription,
  validator("json", jsonSchema),
  async (context) => {
    const jsonParameters = context.req.valid("json");

    const evaluation = await database
      .selectFrom("evaluations")
      .where("model_id", "=", jsonParameters.model_id)
      .where("user_id", "=", context.get("currentUser").id)
      .executeTakeFirst();
    if (evaluation) {
      return context.body(null, 409);
    }

    const result = await database
      .insertInto("evaluations")
      .values({ ...jsonParameters, user_id: context.get("currentUser").id })
      .returningAll()
      .executeTakeFirstOrThrow();

    return context.json(result);
  },
);

export default application;
