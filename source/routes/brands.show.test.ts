import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "bun:test";
import { insertBrand, insertModel } from "../test_helper.factories.js";

describe("GET /brands/:id", () => {
  it("responds with success and returns the brand", async () => {
    const { brand, modelCount } = await database.transaction().execute(async (transaction) => {
      const brand = await insertBrand(transaction);
      await insertModel(transaction, { brand_id: brand.id });
      await insertModel(transaction, { brand_id: brand.id });
      return { brand, modelCount: 2 };
    });

    const body = {
      created_at: brand.created_at.toISOString(),
      id: brand.id,
      model_count: modelCount,
      name: brand.name,
      updated_at: brand.updated_at.toISOString(),
    };

    const response = await application.request(`/brands/${brand.id}`);
    expect(await response.json()).toEqual(body);
    expect(response.ok).toBe(true);
  });
});
