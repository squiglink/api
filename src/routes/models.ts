import { database } from "../database.js";
import { Hono } from "hono";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { sql } from "kysely";

const application = new Hono();

application.get("/models", async (context) => {
  const pageNumber = Number(context.req.query("page")) || 1;
  const pageSize = 10;

  const { count } = await database
    .selectFrom("models")
    .select(database.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  const pageCount = Math.ceil(Number(count) / pageSize);

  const searchQueryParameter = context.req.query("query");
  const page = await database
    .selectFrom("models")
    .innerJoin("brands", "brands.id", "models.brand_id")
    .select(["models.id", "models.created_at", "models.name", "models.updated_at"])
    .select((expressionBuilder) =>
      jsonObjectFrom(
        expressionBuilder
          .selectFrom("brands")
          .selectAll()
          .select([
            sql`to_char(brands.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z')`.as("created_at"),
            sql`to_char(brands.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z')`.as("updated_at"),
          ])
          .whereRef("brands.id", "=", "models.brand_id"),
      ).as("brand"),
    )
    .$if(searchQueryParameter !== undefined, (selectQueryBuilder) =>
      selectQueryBuilder.orderBy(
        sql`concat(brands.name, ' ', models.name) <-> ${searchQueryParameter}`,
      ),
    )
    .orderBy("models.created_at")
    .limit(pageSize)
    .offset((pageNumber - 1) * pageSize)
    .execute();

  return context.json({ page_count: pageCount, page: page });
});

export default application;
