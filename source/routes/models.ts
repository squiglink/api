import zod from "zod";
import { Hono } from "hono";
import { database } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { sql } from "kysely";

const application = new Hono();

const querySchema = zod.object({
  database_id: zod.string().optional(),
  page: zod.coerce.number().optional().default(1),
  query: zod.string().optional(),
});

const responseSchema = zod.object({
  page: zod.array(
    zod.object({
      brand: zod.object({
        created_at: zod.string(),
        id: zod.string(),
        name: zod.string(),
        updated_at: zod.string(),
      }),
      created_at: zod.string(),
      id: zod.string(),
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

application.get("/models", routeDescription, validator("query", querySchema), async (context) => {
  const queryParameters = context.req.valid("query");

  const pageSize = 10;

  const { count } = await database
    .selectFrom("models")
    .select(database.fn.countAll().as("count"))
    .$if(queryParameters.database_id !== undefined, (selectQueryBuilder) =>
      selectQueryBuilder.where("models.id", "in", (expressionBuilder) =>
        expressionBuilder
          .selectFrom("measurements")
          .select("measurements.model_id")
          .where("measurements.database_id", "=", queryParameters.database_id!),
      ),
    )
    .executeTakeFirstOrThrow();
  const pageCount = Math.ceil(Number(count) / pageSize);

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
    .$if(queryParameters.database_id !== undefined, (selectQueryBuilder) =>
      selectQueryBuilder.where("models.id", "in", (expressionBuilder) =>
        expressionBuilder
          .selectFrom("measurements")
          .select("measurements.model_id")
          .where("measurements.database_id", "=", queryParameters.database_id!),
      ),
    )
    .$if(queryParameters.query !== undefined, (selectQueryBuilder) =>
      selectQueryBuilder.orderBy(
        sql`concat(brands.name, ' ', models.name) <-> ${queryParameters.query}`,
      ),
    )
    .orderBy("models.created_at")
    .limit(pageSize)
    .offset((queryParameters.page - 1) * pageSize)
    .execute();

  return context.json({ page_count: pageCount, page: page });
});

export default application;
