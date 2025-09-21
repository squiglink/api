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
      model_count: zod.string(),
      name: zod.string(),
      updated_at: zod.string(),
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

application.get("/brands", routeDescription, validator("query", querySchema), async (context) => {
  const queryParameters = context.req.valid("query");

  const pageSize = 10;

  const { count } = await database
    .selectFrom("brands")
    .select(database.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  const pageCount = Math.ceil(Number(count) / pageSize);

  const searchQueryParameter = queryParameters.query;
  const page = await database
    .selectFrom("brands")
    .leftJoin("models", "brands.id", "models.brand_id")
    .selectAll("brands")
    .select(database.fn.count("models.id").as("model_count"))
    .$if(searchQueryParameter !== undefined, (selectQueryBuilder) =>
      selectQueryBuilder.orderBy(sql`brands.name <-> ${searchQueryParameter}`),
    )
    .orderBy("brands.created_at")
    .groupBy("brands.id")
    .limit(pageSize)
    .offset((queryParameters.page - 1) * pageSize)
    .execute();

  return context.json({ page_count: pageCount, page: page });
});

export default application;
