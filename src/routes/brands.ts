import { databaseMiddleware } from "../middlewares/database_middleware.js";
import { Hono } from "hono";
import { sql } from "kysely";

const application = new Hono();

application.get("/", databaseMiddleware, async (context) => {
  const pageNumber = Number(context.req.query("page")) || 1;
  const pageSize = 10;

  const searchQueryParameter = context.req.query("query");
  const page = await context.var.database
    .selectFrom("brands")
    .leftJoin("models", "brands.id", "models.brand_id")
    .selectAll("brands")
    .select(context.var.database.fn.count("models.id").as("model_count"))
    .$if(searchQueryParameter != undefined, (selectQueryBuilder) =>
      selectQueryBuilder.orderBy(sql`brands.name <-> ${searchQueryParameter}`),
    )
    .orderBy("brands.id")
    .groupBy("brands.id")
    .limit(pageSize)
    .offset((pageNumber - 1) * pageSize)
    .execute();

  const { count } = await context.var.database
    .selectFrom("brands")
    .select(context.var.database.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  const pageCount = Math.ceil(Number(count) / 10);

  return context.json({ page: page, page_count: pageCount });
});

export default application;
