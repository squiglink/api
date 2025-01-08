import { database } from "../database.js";
import { Hono } from "hono";
import { sql } from "kysely";

const application = new Hono();

application.get("/", async (context) => {
  const pageNumber = Number(context.req.query("page")) || 1;
  const pageSize = 10;

  const searchQueryParameter = context.req.query("query");
  const page = await database
    .selectFrom("databases")
    .selectAll()
    .$if(searchQueryParameter != undefined, (selectQueryBuilder) =>
      selectQueryBuilder.orderBy(
        sql`concat(databases.kind, ' ', databases.path) <-> ${context.req.query("query")}`,
      ),
    )
    .orderBy("databases.id")
    .limit(pageSize)
    .offset((pageNumber - 1) * pageSize)
    .execute();

  const { count } = await database
    .selectFrom("databases")
    .select(database.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  const pageCount = Math.ceil(Number(count) / 10);

  return context.json({ page: page, page_count: pageCount });
});

export default application;
