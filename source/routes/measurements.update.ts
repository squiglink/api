import zod from "zod";
import { Hono } from "hono";
import { database, touch } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";
import { parseMeasurement } from "../services/parse_measurement.js";
import { verifyDatabaseUser } from "../services/verify_database_user.js";

const application = new Hono<{
  Variables: {
    currentUser: { id: string };
  };
}>();

const jsonSchema = zod.object({
  database_id: zod.string().optional(),
  kind: zod
    .enum(["frequency_response", "harmonic_distortion", "impedance", "sound_isolation"])
    .optional(),
  label: zod.string().optional(),
  left_channel: zod.string().optional(),
  model_id: zod.string().optional(),
  right_channel: zod.string().optional(),
});

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
    400: { description: "Bad Request" },
    401: { description: "Unauthorized" },
    404: { description: "Not Found" },
  },
});

application.patch(
  "/measurements/:id",
  routeDescription,
  validator("json", jsonSchema),
  validator("param", paramSchema),
  async (context) => {
    const jsonParameters = context.req.valid("json");
    const paramParameters = context.req.valid("param");

    const measurement = await database
      .selectFrom("measurements")
      .select("database_id")
      .where("id", "=", paramParameters.id)
      .executeTakeFirst();
    if (!measurement) return context.body(null, 404);
    if (
      !(await verifyDatabaseUser(
        context.get("currentUser").id,
        database,
        jsonParameters.database_id || measurement.database_id,
      ))
    ) {
      return context.body(null, 401);
    }

    let channels: { left_channel?: string; right_channel?: string } = {};
    if (jsonParameters.left_channel) {
      const [leftChannelParsed, leftChannelError] = parseMeasurement(jsonParameters.left_channel);
      if (leftChannelError) return context.json({ error: leftChannelError }, 400);
      channels.left_channel = leftChannelParsed;
    }
    if (jsonParameters.right_channel) {
      const [rightChannelParsed, rightChannelError] = parseMeasurement(
        jsonParameters.right_channel,
      );
      if (rightChannelError) return context.json({ error: rightChannelError }, 400);
      channels.right_channel = rightChannelParsed;
    }

    const result = await database
      .updateTable("measurements")
      .set({ ...jsonParameters, ...channels })
      .set(touch)
      .where("id", "=", paramParameters.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return context.json(result);
  },
);

export default application;
