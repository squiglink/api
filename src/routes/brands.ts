import { database } from "../database.js";
import { Hono } from "hono";
import { sql } from "kysely";
import { validationMiddleware } from "../middlewares/validation.js";
import zod from "zod";

const application = new Hono<{
  Variables: { queryParameters: zod.infer<typeof querySchema> };
}>();

const querySchema = zod.object({
  page: zod.coerce.number().optional().default(1),
  query: zod.string().optional(),
});

application.get("/brands", validationMiddleware({ querySchema }), async (context) => {
  const queryParameters = context.get("queryParameters");

  const pageNumber = queryParameters.page;
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
    .offset((pageNumber - 1) * pageSize)
    .execute();

  return context.json({ page_count: pageCount, page: page });
});

export default application;
