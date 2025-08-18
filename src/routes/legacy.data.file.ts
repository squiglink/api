import { database } from "../database.js";
import { Hono } from "hono";
import { validationMiddleware } from "../middlewares/validation.js";
import zod from "zod";

const application = new Hono<{
  Variables: { pathParameters: zod.infer<typeof pathSchema> };
}>();

const pathSchema = zod.object({
  file_name: zod.string().regex(/^.* (L|R)\.txt$/),
});

application.get(
  "/legacy/data/:file_name{.* (L|R)\.txt}",
  validationMiddleware({ pathSchema: pathSchema }),
  async (context) => {
    const pathParameters = context.get("pathParameters");

    const [id, channelAndExtension] = pathParameters.file_name.split(" ");
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

    if (result === undefined) {
      return context.body(null, 404);
    } else {
      if (channel === "L") return context.text(result.left_channel);
      if (channel === "R") return context.text(result.right_channel);
    }
  },
);

export default application;
