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
  kind: zod.enum(["earbuds", "headphones", "iems"]),
  path: zod.string(),
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
  },
});

application.post("/databases", routeDescription, validator("json", jsonSchema), async (context) => {
  const jsonParameters = context.req.valid("json");

  const result = await database
    .insertInto("databases")
    .values({ ...jsonParameters, user_id: context.get("currentUser").id })
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
