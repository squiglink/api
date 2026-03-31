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
  kind: zod.enum(["earbuds", "headphones", "iems"]),
  path: zod.string(),
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
  "/databases/:id",
  routeDescription,
  validator("param", paramSchema),
  async (context) => {
    const paramParameters = context.req.valid("param");

    const result = await database
      .selectFrom("databases")
      .selectAll()
      .where("id", "=", paramParameters.id)
      .executeTakeFirst();
    if (!result) return context.body(null, 404);

    return context.json(result);
  },
);

export default application;
