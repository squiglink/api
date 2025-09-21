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
  database_id: zod.string(),
  id: zod.string(),
  kind: zod.enum(["frequency_response", "harmonic_distortion", "impedance", "sound_isolation"]),
  label: zod.string(),
  left_channel: zod.string().nullable(),
  model_id: zod.string(),
  right_channel: zod.string().nullable(),
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

application.get(
  "/measurements/:id",
  routeDescription,
  validator("param", paramSchema),
  async (context) => {
    const paramParameters = context.req.valid("param");

    const result = await database
      .selectFrom("measurements")
      .selectAll()
      .where("id", "=", paramParameters.id)
      .orderBy("measurements.created_at")
      .executeTakeFirst();
    if (!result) return context.body(null, 404);

    return context.json(result);
  },
);

export default application;
