import zod from "zod";
import { Hono } from "hono";
import { database, touch } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";

const application = new Hono<{
  Variables: {
    currentUser: { id: string; role: string };
  };
}>();

const jsonSchema = zod.object({
  brand_id: zod.string().optional(),
  name: zod.string().optional(),
});

const paramSchema = zod.object({
  id: zod.string(),
});

const responseSchema = zod.object({
  brand_id: zod.string(),
  created_at: zod.string(),
  id: zod.string(),
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
    403: { description: "Forbidden" },
    404: { description: "Not Found" },
  },
});

application.patch(
  "/models/:id",
  routeDescription,
  validator("json", jsonSchema),
  validator("param", paramSchema),
  async (context) => {
    const jsonParameters = context.req.valid("json");
    const paramParameters = context.req.valid("param");

    const model = await database
      .selectFrom("models")
      .select("id")
      .where("id", "=", paramParameters.id)
      .executeTakeFirst();
    if (!model) return context.body(null, 404);

    if (context.get("currentUser").role !== "root") {
      return context.body(null, 403);
    }

    const result = await database
      .updateTable("models")
      .set(jsonParameters)
      .set(touch)
      .where("id", "=", paramParameters.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return context.json(result);
  },
);

export default application;
