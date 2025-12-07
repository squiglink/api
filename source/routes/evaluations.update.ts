import zod from "zod";
import { Hono } from "hono";
import { database, touch } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";
import { validateOwner } from "../services/validate_owner.js";

const application = new Hono<{
  Variables: {
    currentUser: { id: string };
  };
}>();

const jsonSchema = zod.object({
  model_id: zod.string().optional(),
  review_score: zod.number().optional(),
  review_url: zod.string().optional(),
  shop_url: zod.string().optional(),
});

const paramSchema = zod.object({
  id: zod.string(),
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
    401: { description: "Unauthorized" },
    404: { description: "Not Found" },
  },
});

application.patch(
  "/evaluations/:id",
  routeDescription,
  validator("json", jsonSchema),
  validator("param", paramSchema),
  async (context) => {
    const jsonParameters = context.req.valid("json");
    const paramParameters = context.req.valid("param");

    const evaluation = await database
      .selectFrom("evaluations")
      .select("user_id")
      .where("id", "=", paramParameters.id)
      .executeTakeFirst();
    if (!evaluation) return context.body(null, 404);

    if (
      !(await validateOwner(
        context.get("currentUser").id,
        database,
        paramParameters.id,
        "evaluations",
      ))
    ) {
      return context.body(null, 401);
    }

    const result = await database
      .updateTable("evaluations")
      .set(jsonParameters)
      .set(touch)
      .where("id", "=", paramParameters.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return context.json(result);
  },
);

export default application;
