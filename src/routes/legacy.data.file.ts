import { database } from "../database.js";
import { Hono } from "hono";

const application = new Hono();

application.get("/legacy/data/:file_name{.* (L|R)\.txt}", async (context) => {
  const [id, channelAndExtension] = context.req.param("file_name").split(" ");
  const [channel, _extension] = channelAndExtension.split(".");

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
});

export default application;
