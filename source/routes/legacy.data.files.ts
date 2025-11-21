import zod from "zod";
import { Hono } from "hono";
import { database } from "../database.js";
import { describeRoute, validator } from "hono-openapi";

const application = new Hono();

const paramSchema = zod.object({
  file_name: zod.string().regex(/^.* (L|R)\.txt$/),
});

const routeDescription = describeRoute({
  responses: {
    200: { description: "OK" },
    400: { description: "Bad Request" },
    404: { description: "Not Found" },
  },
});

application.get(
  "/legacy/data/:file_name{.* (L|R).txt}",
  routeDescription,
  validator("param", paramSchema),
  async (context) => {
    const paramParameters = context.req.valid("param");

    const [id, channelAndExtension] = paramParameters.file_name.split(" ");
    const [channel, extension] = channelAndExtension.split(".");

    const zodSafeParseResult = zod
      .object({
        channel: zod.enum(["L", "R"]),
        extension: zod.literal("txt"),
        id: zod.uuid(),
      })
      .safeParse({
        channel,
        extension,
        id,
      });
    if (!zodSafeParseResult.success) {
      return context.json(zodSafeParseResult.error, 400);
    }

    const result = await database
      .selectFrom("measurements")
      .select(["left_channel", "right_channel"])
      .where("id", "=", id)
      .executeTakeFirst();

    if (!result) return context.body(null, 404);

    if (channel === "L") {
      if (!result.left_channel) return context.body(null, 404);
      return context.text(result.left_channel);
    }
    if (channel === "R") {
      if (!result.right_channel) return context.body(null, 404);
      return context.text(result.right_channel);
    }
  },
);

export default application;
