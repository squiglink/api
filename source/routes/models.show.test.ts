import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "bun:test";
import { insertBrand, insertModel } from "../test_helper.factories.js";

describe("GET /models/:id", () => {
  it("responds with success and returns the model", async () => {
    const { brand, model } = await database.transaction().execute(async (transaction) => {
      const brand = await insertBrand(transaction);
      const model = await insertModel(transaction, { brand_id: brand.id });
      return { brand, model };
    });

    const body = {
      brand: {
        created_at: brand.created_at.toISOString(),
        id: brand.id,
        name: brand.name,
        updated_at: brand.updated_at.toISOString(),
      },
      created_at: model.created_at.toISOString(),
      id: model.id,
      name: model.name,
      updated_at: model.updated_at.toISOString(),
    };

    const response = await application.request(`/models/${model.id}`);
    expect(await response.json()).toEqual(body);
    expect(response.ok).toBe(true);
  });
});
