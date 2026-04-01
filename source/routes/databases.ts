import zod from "zod";
import { Hono } from "hono";
import { database } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";
import { sql } from "kysely";

const application = new Hono();

const querySchema = zod.object({
  page: zod.coerce.number().optional().default(1),
  query: zod.string().optional(),
  user_id: zod.string().optional(),
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
      .$if(queryParameters.user_id !== undefined, (selectQueryBuilder) =>
        selectQueryBuilder.where("databases.user_id", "=", queryParameters.user_id!),
      )
      .executeTakeFirstOrThrow();
    const pageCount = Math.ceil(Number(count) / pageSize);

    const page = await database
      .selectFrom("databases")
      .selectAll()
      .$if(queryParameters.user_id !== undefined, (selectQueryBuilder) =>
        selectQueryBuilder.where("databases.user_id", "=", queryParameters.user_id!),
      )
      .$if(queryParameters.query !== undefined, (selectQueryBuilder) =>
        selectQueryBuilder.orderBy(
          sql`concat(databases.kind, ' ', databases.path) <-> ${queryParameters.query}`,
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
