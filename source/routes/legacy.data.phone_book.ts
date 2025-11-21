import zod from "zod";
import { Hono } from "hono";
import { database } from "../database.js";
import { describeRoute, resolver, validator } from "hono-openapi";

const application = new Hono();

const querySchema = zod.object({
  database_id: zod.string(),
});

const responseSchema = zod.array(
  zod.object({
    name: zod.string(),
    phones: zod.array(
      zod.object({
        name: zod.string(),
        file: zod.array(zod.string()),
        suffix: zod.array(zod.string()),
        reviewScore: zod.string().optional(),
        reviewLink: zod.string().optional(),
        shopLink: zod.string().optional(),
      }),
    ),
  }),
);

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
  "/legacy/data/phone_book.json",
  routeDescription,
  validator("query", querySchema),
  async (context) => {
    const queryParameters = context.req.valid("query");

    const { result } = await database.transaction().execute(async (transaction) => {
      const records = await transaction
        .selectFrom("brands")
        .innerJoin("models", "models.brand_id", "brands.id")
        .innerJoin("measurements", "measurements.model_id", "models.id")
        .innerJoin("databases", "databases.id", "measurements.database_id")
        .leftJoin("evaluations", "evaluations.model_id", "models.id")
        .where("measurements.database_id", "=", queryParameters.database_id)
        .select([
          "brands.name as brand_name",
          "evaluations.review_score as evaluation_review_score",
          "evaluations.review_url as evaluation_review_url",
          "evaluations.shop_url as evaluation_shop_url",
          "measurements.id as measurement_id",
          "measurements.label as measurement_label",
          "models.name as model_name",
        ])
        .orderBy("brands.created_at")
        .orderBy("models.created_at")
        .orderBy("measurements.created_at")
        .execute();

      const brands = new Map<
        string,
        {
          name: string;
          phones: Map<
            string,
            {
              name: string;
              file: string[];
              suffix: string[];
              reviewScore?: string;
              reviewLink?: string;
              shopLink?: string;
            }
          >;
        }
      >();

      for (const record of records) {
        if (!brands.has(record.brand_name)) {
          brands.set(record.brand_name, {
            name: record.brand_name,
            phones: new Map(),
          });
        }
        const brand = brands.get(record.brand_name)!;
        if (!brand.phones.has(record.model_name)) {
          const phone: {
            name: string;
            file: string[];
            suffix: string[];
            reviewScore?: string;
            reviewLink?: string;
            shopLink?: string;
          } = {
            name: record.model_name,
            file: [record.measurement_id],
            suffix: [record.measurement_label],
          };
          if (record.evaluation_review_score !== null)
            phone.reviewScore = record.evaluation_review_score.toString();
          if (record.evaluation_review_url !== null)
            phone.reviewLink = record.evaluation_review_url;
          if (record.evaluation_shop_url !== null) phone.shopLink = record.evaluation_shop_url;
          brand.phones.set(record.model_name, phone);
        } else {
          const phone = brand.phones.get(record.model_name)!;
          phone.file.push(record.measurement_id);
          phone.suffix.push(record.measurement_label);
        }
      }

      const result = Array.from(brands.values()).map((brand) => ({
        name: brand.name,
        phones: Array.from(brand.phones.values()),
      }));

      return { result };
    });

    return context.json(result);
  },
);

export default application;
