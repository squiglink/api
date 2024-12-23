import { databaseMiddleware } from "../middlewares/database_middleware.js";
import { Hono } from "hono";
import { jsonObjectFrom } from "kysely/helpers/postgres";

const application = new Hono();

application.get("/", databaseMiddleware, async (context) => {
  const pageNumber = Number(context.req.query("page")) || 1;
  const pageSize = 10;

  const page = await context.var.database
    .selectFrom("models")
    .select(["models.id", "models.name", "models.shop_url"])
    .select((expressionBuilder) =>
      jsonObjectFrom(
        expressionBuilder
          .selectFrom("brands")
          .selectAll()
          .whereRef("brands.id", "=", "models.brand_id"),
      ).as("brand"),
    )
    .limit(pageSize)
    .offset((pageNumber - 1) * pageSize)
    .execute();

  const { count } = await context.var.database
    .selectFrom("models")
    .select(context.var.database.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  const pageCount = Math.ceil(Number(count) / 10);

  return context.json({ page: page, page_count: pageCount });
});

export default application;
