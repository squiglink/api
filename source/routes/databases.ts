import zod from "zod";
import { Hono } from "hono";
import { database } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";
import { sql } from "kysely";

const application = new Hono();

const querySchema = zod.object({
  page: zod.coerce.number().optional().default(1),
  query: zod.string().optional(),
});

const responseSchema = zod.object({
  page: zod.array(
    zod.object({
      created_at: zod.string(),
      id: zod.string(),
      kind: zod.enum(["earbuds", "headphones", "iems"]),
      path: zod.string(),
      updated_at: zod.string(),
      user_id: zod.string(),
    }),
  ),
  page_count: zod.number(),
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
  },
});

application.get(
  "/databases",
  routeDescription,
  validator("query", querySchema),
  async (context) => {
    const queryParameters = context.req.valid("query");

    const pageSize = 10;

    const { count } = await database
      .selectFrom("databases")
      .select(database.fn.countAll().as("count"))
      .executeTakeFirstOrThrow();
    const pageCount = Math.ceil(Number(count) / pageSize);

    const searchQueryParameter = queryParameters.query;
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
      .offset((queryParameters.page - 1) * pageSize)
      .execute();

    return context.json({ page_count: pageCount, page: page });
  },
);

export default application;
