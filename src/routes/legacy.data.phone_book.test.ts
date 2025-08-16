import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import {
  insertBrand,
  insertDatabase,
  insertEvaluation,
  insertMeasurement,
  insertModel,
  insertUser,
} from "../test_helper.factories.js";
import application from "../application.js";

describe("GET /legacy/data/phone_book.json", () => {
  it("responds with success", async () => {
    const { brands, databaseId, evaluations, measurements, models } = await database
      .transaction()
      .execute(async (transaction) => {
        const userId = (await insertUser(transaction)).id;
        const databaseId = (await insertDatabase(transaction, { user_id: userId })).id;

        const brands = [];
        const evaluations = [];
        const measurements = [];
        const models = [];

        for (let brandIndex = 0; brandIndex < 2; brandIndex++) {
          const brand = await insertBrand(transaction);
          brands.push(brand);
          for (let modelIndex = 0; modelIndex < 2; modelIndex++) {
            const model = await insertModel(transaction, { brand_id: brand.id });
            models.push(model);

            const evaluation = await insertEvaluation(transaction, {
              model_id: model.id,
              user_id: userId,
            });
            evaluations.push(evaluation);

            for (let measurementIndex = 0; measurementIndex < 2; measurementIndex++) {
              const measurement = await insertMeasurement(transaction, {
                database_id: databaseId,
                model_id: model.id,
              });
              measurements.push(measurement);
            }
          }
        }

        return {
          brands,
          databaseId,
          evaluations,
          measurements,
          models,
        };
      });

    const body = [
      {
        name: brands[0].name,
        phones: [
          {
            name: models[0].name,
            file: [measurements[0].id, measurements[1].id],
            suffix: [measurements[0].label, measurements[1].label],
            reviewScore: evaluations[0].review_score!.toString(),
            reviewLink: evaluations[0].review_url,
            shopLink: evaluations[0].shop_url,
          },
          {
            name: models[1].name,
            file: [measurements[2].id, measurements[3].id],
            suffix: [measurements[2].label, measurements[3].label],
            reviewScore: evaluations[1].review_score!.toString(),
            reviewLink: evaluations[1].review_url,
            shopLink: evaluations[1].shop_url,
          },
        ],
      },
      {
        name: brands[1].name,
        phones: [
          {
            name: models[2].name,
            file: [measurements[4].id, measurements[5].id],
            suffix: [measurements[4].label, measurements[5].label],
            reviewScore: evaluations[2].review_score!.toString(),
            reviewLink: evaluations[2].review_url,
            shopLink: evaluations[2].shop_url,
          },
          {
            name: models[3].name,
            file: [measurements[6].id, measurements[7].id],
            suffix: [measurements[6].label, measurements[7].label],
            reviewScore: evaluations[3].review_score!.toString(),
            reviewLink: evaluations[3].review_url,
            shopLink: evaluations[3].shop_url,
          },
        ],
      },
    ];

    const response = await application.request(
      `/legacy/data/phone_book.json?database_id=${databaseId}`,
    );
    expect(await response.json()).toEqual(body);
    expect(response.ok).toBe(true);
  });

  it("responds with success without evaluations", async () => {
    const { brands, databaseId, measurements, models } = await database
      .transaction()
      .execute(async (transaction) => {
        const userId = (await insertUser(transaction)).id;
        const databaseId = (await insertDatabase(transaction, { user_id: userId })).id;

        const brands = [];
        const measurements = [];
        const models = [];

        for (let brandIndex = 0; brandIndex < 2; brandIndex++) {
          const brand = await insertBrand(transaction);
          brands.push(brand);
          for (let modelIndex = 0; modelIndex < 2; modelIndex++) {
            const model = await insertModel(transaction, { brand_id: brand.id });
            models.push(model);

            for (let measurementIndex = 0; measurementIndex < 2; measurementIndex++) {
              const measurement = await insertMeasurement(transaction, {
                database_id: databaseId,
                model_id: model.id,
              });
              measurements.push(measurement);
            }
          }
        }

        return {
          brands,
          databaseId,
          measurements,
          models,
        };
      });

    const body = [
      {
        name: brands[0].name,
        phones: [
          {
            name: models[0].name,
            file: [measurements[0].id, measurements[1].id],
            suffix: [measurements[0].label, measurements[1].label],
          },
          {
            name: models[1].name,
            file: [measurements[2].id, measurements[3].id],
            suffix: [measurements[2].label, measurements[3].label],
          },
        ],
      },
      {
        name: brands[1].name,
        phones: [
          {
            name: models[2].name,
            file: [measurements[4].id, measurements[5].id],
            suffix: [measurements[4].label, measurements[5].label],
          },
          {
            name: models[3].name,
            file: [measurements[6].id, measurements[7].id],
            suffix: [measurements[6].label, measurements[7].label],
          },
        ],
      },
    ];

    const response = await application.request(
      `/legacy/data/phone_book.json?database_id=${databaseId}`,
    );
    expect(await response.json()).toEqual(body);
    expect(response.ok).toBe(true);
  });
});
