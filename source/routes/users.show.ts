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
  display_name: zod.string(),
  email: zod.string(),
  id: zod.string(),
  scoring_system: zod.string(),
  updated_at: zod.string(),
  username: zod.string(),
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
  "/users/:id",
  routeDescription,
  validator("param", paramSchema),
  async (context) => {
    const paramParameters = context.req.valid("param");

    const result = await database
      .selectFrom("users")
      .selectAll()
      .where("users.id", "=", paramParameters.id)
      .executeTakeFirst();
    if (!result) return context.body(null, 404);

    return context.json(result);
  },
);

export default application;
