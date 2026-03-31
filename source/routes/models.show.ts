import zod from "zod";
import { Hono } from "hono";
import { database } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { sql } from "kysely";

const application = new Hono();

const paramSchema = zod.object({
  id: zod.string(),
});

const responseSchema = zod.object({
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
    404: { description: "Not Found" },
  },
});

application.get(
  "/models/:id",
  routeDescription,
  validator("param", paramSchema),
  async (context) => {
    const paramParameters = context.req.valid("param");

    const result = await database
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
      .where("models.id", "=", paramParameters.id)
      .executeTakeFirst();
    if (!result) return context.body(null, 404);

    return context.json(result);
  },
);

export default application;
