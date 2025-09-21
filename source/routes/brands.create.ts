import zod from "zod";
import { Hono } from "hono";
import { database } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";

const application = new Hono();

const jsonSchema = zod.object({
  name: zod.string(),
});

const responseSchema = zod.object({
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
  },
});

application.post("/brands", routeDescription, validator("json", jsonSchema), async (context) => {
  const jsonParameters = context.req.valid("json");

  const result = await database
    .insertInto("brands")
    .values(jsonParameters)
    .returningAll()
    .executeTakeFirstOrThrow();

  return context.json(result);
});

export default application;
