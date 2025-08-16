import { database } from "../database.js";
import { Hono } from "hono";
import { sql } from "kysely";

const application = new Hono();

application.get("/databases", async (context) => {
  const pageNumber = Number(context.req.query("page")) || 1;
  const pageSize = 10;

  const { count } = await database
    .selectFrom("databases")
    .select(database.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  const pageCount = Math.ceil(Number(count) / pageSize);

  const searchQueryParameter = context.req.query("query");
  const page = await database
    .selectFrom("databases")
    .selectAll()
    .$if(searchQueryParameter !== undefined, (selectQueryBuilder) =>
      selectQueryBuilder.orderBy(
        sql`concat(databases.kind, ' ', databases.path) <-> ${searchQueryParameter}`,
      ),
    )
    .orderBy("databases.created_at")
    .limit(pageSize)
    .offset((pageNumber - 1) * pageSize)
    .execute();

  return context.json({ page_count: pageCount, page: page });
});

export default application;
