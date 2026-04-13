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
  kind: zod.enum(["earbuds", "headphones", "iems"]).optional(),
  path: zod.string().optional(),
});

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
    403: { description: "Forbidden" },
    404: { description: "Not Found" },
  },
});

application.patch(
  "/databases/:id",
  routeDescription,
  validator("json", jsonSchema),
  validator("param", paramSchema),
  async (context) => {
    const jsonParameters = context.req.valid("json");
    const paramParameters = context.req.valid("param");

    const userDatabase = await database
      .selectFrom("databases")
      .select("user_id")
      .where("id", "=", paramParameters.id)
      .executeTakeFirst();
    if (!userDatabase) return context.body(null, 404);

    if (
      !(await validateOwner(
        context.get("currentUser").id,
        database,
        paramParameters.id,
        "databases",
      ))
    ) {
      return context.body(null, 403);
    }

    const result = await database
      .updateTable("databases")
      .set(jsonParameters)
      .set(touch)
      .where("id", "=", paramParameters.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return context.json(result);
  },
);

export default application;
