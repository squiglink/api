import { databaseMiddleware } from "../middlewares/database_middleware.js";
import { Hono } from "hono";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { sql } from "kysely";

const application = new Hono();

application.get("/", databaseMiddleware, async (context) => {
  const pageNumber = Number(context.req.query("page")) || 1;
  const pageSize = 10;

  const searchQueryParameter = context.req.query("query");
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
    .$if(searchQueryParameter != undefined, (selectQueryBuilder) =>
      selectQueryBuilder
        .leftJoin("brands", "brands.id", "models.brand_id")
        .orderBy([
          sql`concat(brands.name, ' ', models.name) <-> ${context.req.query("query")}`,
          "models.id",
        ]),
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
