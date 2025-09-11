import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertBrand, insertModel } from "../test_helper.factories.js";
import application from "../application.js";

describe("GET /brands", () => {
  it("responds with success and returns brands", async () => {
    const brands = await database.transaction().execute(async (transaction) => {
      const brands: { created_at: Date; id: string; name: string; updated_at: Date }[] = [];

      for (let brandIndex = 1; brandIndex <= 11; brandIndex++) {
        const brand = await insertBrand(transaction);
        brands.push(brand);
        for (let modelIndex = 1; modelIndex <= brandIndex; modelIndex++) {
          await insertModel(transaction, { brand_id: brand.id });
        }
      }

      return brands;
    });

    const firstPage = {
      page_count: 2,
      page: [
        {
          created_at: brands[0].created_at,
          id: brands[0].id,
          model_count: 1,
          name: brands[0].name,
          updated_at: brands[0].updated_at,
        },
        {
          created_at: brands[1].created_at,
          id: brands[1].id,
          model_count: 2,
          name: brands[1].name,
          updated_at: brands[1].updated_at,
        },
        {
          created_at: brands[2].created_at,
          id: brands[2].id,
          model_count: 3,
          name: brands[2].name,
          updated_at: brands[2].updated_at,
        },
        {
          created_at: brands[3].created_at,
          id: brands[3].id,
          model_count: 4,
          name: brands[3].name,
          updated_at: brands[3].updated_at,
        },
        {
          created_at: brands[4].created_at,
          id: brands[4].id,
          model_count: 5,
          name: brands[4].name,
          updated_at: brands[4].updated_at,
        },
        {
          created_at: brands[5].created_at,
          id: brands[5].id,
          model_count: 6,
          name: brands[5].name,
          updated_at: brands[5].updated_at,
        },
        {
          created_at: brands[6].created_at,
          id: brands[6].id,
          model_count: 7,
          name: brands[6].name,
          updated_at: brands[6].updated_at,
        },
        {
          created_at: brands[7].created_at,
          id: brands[7].id,
          model_count: 8,
          name: brands[7].name,
          updated_at: brands[7].updated_at,
        },
        {
          created_at: brands[8].created_at,
          id: brands[8].id,
          model_count: 9,
          name: brands[8].name,
          updated_at: brands[8].updated_at,
        },
        {
          created_at: brands[9].created_at,
          id: brands[9].id,
          model_count: 10,
          name: brands[9].name,
          updated_at: brands[9].updated_at,
        },
      ],
    };
    const secondPage = {
      page_count: 2,
      page: [
        {
          created_at: brands[10].created_at,
          id: brands[10].id,
          model_count: 11,
          name: brands[10].name,
          updated_at: brands[10].updated_at,
        },
      ],
    };

    const pagelessResponse = await application.request("/brands");
    expect(await pagelessResponse.json()).toEqual(firstPage);
    expect(pagelessResponse.ok).toBe(true);

    const firstPageResponse = await application.request("/brands?page=1");
    expect(await firstPageResponse.json()).toEqual(firstPage);
    expect(firstPageResponse.ok).toBe(true);

    const secondPageResponse = await application.request("/brands?page=2");
    expect(await secondPageResponse.json()).toEqual(secondPage);
    expect(secondPageResponse.ok).toBe(true);
  });

  it("responds with success and queries the name", async () => {
    const brands = await database.transaction().execute(async (transaction) => {
      const brands: { created_at: Date; id: string; name: string; updated_at: Date }[] = [];

      for (let brandIndex = 1; brandIndex <= 11; brandIndex++) {
        const brand = await insertBrand(transaction, {
          name: brandIndex > 8 ? `Foo Brand ${brandIndex}` : `Bar Brand ${brandIndex}`,
        });
        brands.push(brand);
        for (let modelIndex = 1; modelIndex <= brandIndex; modelIndex++) {
          await insertModel(transaction, {
            brand_id: brand.id,
            name: `Model ${modelIndex}`,
          });
        }
      }

      return brands;
    });

    const queryBrandFirstPage = {
      page_count: 2,
      page: [
        {
          created_at: brands[8].created_at,
          id: brands[8].id,
          model_count: 9,
          name: brands[8].name,
          updated_at: brands[8].updated_at,
        },
        {
          created_at: brands[9].created_at,
          id: brands[9].id,
          model_count: 10,
          name: brands[9].name,
          updated_at: brands[9].updated_at,
        },
        {
          created_at: brands[10].created_at,
          id: brands[10].id,
          model_count: 11,
          name: brands[10].name,
          updated_at: brands[10].updated_at,
        },
        {
          created_at: brands[0].created_at,
          id: brands[0].id,
          model_count: 1,
          name: brands[0].name,
          updated_at: brands[0].updated_at,
        },
        {
          created_at: brands[1].created_at,
          id: brands[1].id,
          model_count: 2,
          name: brands[1].name,
          updated_at: brands[1].updated_at,
        },
        {
          created_at: brands[2].created_at,
          id: brands[2].id,
          model_count: 3,
          name: brands[2].name,
          updated_at: brands[2].updated_at,
        },
        {
          created_at: brands[3].created_at,
          id: brands[3].id,
          model_count: 4,
          name: brands[3].name,
          updated_at: brands[3].updated_at,
        },
        {
          created_at: brands[4].created_at,
          id: brands[4].id,
          model_count: 5,
          name: brands[4].name,
          updated_at: brands[4].updated_at,
        },
        {
          created_at: brands[5].created_at,
          id: brands[5].id,
          model_count: 6,
          name: brands[5].name,
          updated_at: brands[5].updated_at,
        },
        {
          created_at: brands[6].created_at,
          id: brands[6].id,
          model_count: 7,
          name: brands[6].name,
          updated_at: brands[6].updated_at,
        },
      ],
    };
    const queryBrandSecondPage = {
      page_count: 2,
      page: [
        {
          created_at: brands[7].created_at,
          id: brands[7].id,
          model_count: 8,
          name: brands[7].name,
          updated_at: brands[7].updated_at,
        },
      ],
    };

    const pagelessResponse = await application.request("/brands?query=foo");
    expect(await pagelessResponse.json()).toEqual(queryBrandFirstPage);
    expect(pagelessResponse.ok).toBe(true);

    const firstPageResponse = await application.request("/brands?query=foo&page=1");
    expect(await firstPageResponse.json()).toEqual(queryBrandFirstPage);
    expect(firstPageResponse.ok).toBe(true);

    const secondPageResponse = await application.request("/brands?query=foo&page=2");
    expect(await secondPageResponse.json()).toEqual(queryBrandSecondPage);
    expect(secondPageResponse.ok).toBe(true);
  });
});
