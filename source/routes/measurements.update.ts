import zod from "zod";
import { Hono } from "hono";
import { database, touch } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";
import { parseMeasurement } from "../services/parse_measurement.js";
import { validateOwner } from "../services/validate_owner.js";

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
  left_channel: zod.string().nullable().optional(),
  model_id: zod.string().optional(),
  right_channel: zod.string().nullable().optional(),
});

const paramSchema = zod.object({
  id: zod.uuid(),
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
    403: { description: "Forbidden" },
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
      .select(["database_id", "left_channel", "right_channel"])
      .where("id", "=", paramParameters.id)
      .executeTakeFirst();
    if (!measurement) return context.body(null, 404);

    const databaseId = jsonParameters.database_id || measurement.database_id;
    if (!(await validateOwner(context.get("currentUser").id, database, databaseId, "databases"))) {
      return context.body(null, 403);
    }

    let channels: { left_channel?: string | null; right_channel?: string | null } = {};
    if (jsonParameters.left_channel === null) {
      channels.left_channel = null;
    } else if (jsonParameters.left_channel) {
      const [leftChannelParsed, leftChannelError] = parseMeasurement(jsonParameters.left_channel);
      if (leftChannelError) return context.json({ error: leftChannelError }, 400);
      channels.left_channel = leftChannelParsed;
    }
    if (jsonParameters.right_channel === null) {
      channels.right_channel = null;
    } else if (jsonParameters.right_channel) {
      const [rightChannelParsed, rightChannelError] = parseMeasurement(
        jsonParameters.right_channel,
      );
      if (rightChannelError) return context.json({ error: rightChannelError }, 400);
      channels.right_channel = rightChannelParsed;
    }

    const {
      left_channel: finalLeftChannel = measurement.left_channel,
      right_channel: finalRightChannel = measurement.right_channel,
    } = channels;
    const { success, error } = zod
      .object({
        left_channel: zod.string().nullable().optional(),
        right_channel: zod.string().nullable().optional(),
      })
      .refine((data) => data.left_channel || data.right_channel, {
        message: "Either `left_channel` or `right_channel` must be provided",
        path: ["left_channel", "right_channel"],
      })
      .safeParse({ left_channel: finalLeftChannel, right_channel: finalRightChannel });
    if (!success) return context.json(error, 400);

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
