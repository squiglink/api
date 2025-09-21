import zod from "zod";
import { Hono } from "hono";
import { database } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";

const application = new Hono();

const querySchema = zod.object({
  database_id: zod.string(),
  model_id: zod.string(),
});

const responseSchema = zod.array(
  zod.object({
    created_at: zod.string(),
    database_id: zod.string(),
    id: zod.string(),
    kind: zod.enum(["frequency_response", "harmonic_distortion", "impedance", "sound_isolation"]),
    label: zod.string(),
    model_id: zod.string(),
    updated_at: zod.string(),
  }),
);

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

application.get(
  "/measurements",
  routeDescription,
  validator("query", querySchema),
  async (context) => {
    const queryParameters = context.req.valid("query");

    const result = await database
      .selectFrom("measurements")
      .select(["created_at", "database_id", "id", "kind", "label", "model_id", "updated_at"])
      .where("database_id", "=", queryParameters.database_id)
      .where("model_id", "=", queryParameters.model_id)
      .orderBy("measurements.created_at")
      .execute();

    return context.json(result);
  },
);

export default application;
