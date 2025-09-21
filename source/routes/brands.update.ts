import zod from "zod";
import { Hono } from "hono";
import { database, touch } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";

const application = new Hono();

const jsonSchema = zod.object({
  name: zod.string().optional(),
});

const paramSchema = zod.object({
  id: zod.string(),
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
    404: { description: "Not Found" },
  },
});

application.patch(
  "/brands/:id",
  routeDescription,
  validator("json", jsonSchema),
  validator("param", paramSchema),
  async (context) => {
    const jsonParameters = context.req.valid("json");
    const paramParameters = context.req.valid("param");

    const result = await database
      .updateTable("brands")
      .set(jsonParameters)
      .set(touch)
      .where("id", "=", paramParameters.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return context.json(result);
  },
);

export default application;
