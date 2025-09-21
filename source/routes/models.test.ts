import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertBrand, insertModel } from "../test_helper.factories.js";

describe("GET /models", () => {
  it("responds with success and returns models", async () => {
    const { brands, models } = await database.transaction().execute(async (transaction) => {
      const brands: { created_at: Date; id: string; name: string; updated_at: Date }[] = [];
      const models: { created_at: Date; id: string; name: string; updated_at: Date }[] = [];

      for (let index = 1; index <= 11; index++) {
        const brand = await insertBrand(transaction);
        brands.push(brand);
        const model = await insertModel(transaction, { brand_id: brand.id });
        models.push(model);
      }

      return { brands, models };
    });

    const firstPage = {
      page_count: 2,
      page: [
        {
          brand: {
            created_at: brands[0].created_at,
            id: brands[0].id,
            name: brands[0].name,
            updated_at: brands[0].updated_at,
          },
          created_at: models[0].created_at,
          id: models[0].id,
          name: models[0].name,
          updated_at: models[0].updated_at,
        },
        {
          brand: {
            created_at: brands[1].created_at,
            id: brands[1].id,
            name: brands[1].name,
            updated_at: brands[1].updated_at,
          },
          created_at: models[1].created_at,
          id: models[1].id,
          name: models[1].name,
          updated_at: models[1].updated_at,
        },
        {
          brand: {
            created_at: brands[2].created_at,
            id: brands[2].id,
            name: brands[2].name,
            updated_at: brands[2].updated_at,
          },
          created_at: models[2].created_at,
          id: models[2].id,
          name: models[2].name,
          updated_at: models[2].updated_at,
        },
        {
          brand: {
            created_at: brands[3].created_at,
            id: brands[3].id,
            name: brands[3].name,
            updated_at: brands[3].updated_at,
          },
          created_at: models[3].created_at,
          id: models[3].id,
          name: models[3].name,
          updated_at: models[3].updated_at,
        },
        {
          brand: {
            created_at: brands[4].created_at,
            id: brands[4].id,
            name: brands[4].name,
            updated_at: brands[4].updated_at,
          },
          created_at: models[4].created_at,
          id: models[4].id,
          name: models[4].name,
          updated_at: models[4].updated_at,
        },
        {
          brand: {
            created_at: brands[5].created_at,
            id: brands[5].id,
            name: brands[5].name,
            updated_at: brands[5].updated_at,
          },
          created_at: models[5].created_at,
          id: models[5].id,
          name: models[5].name,
          updated_at: models[5].updated_at,
        },
        {
          brand: {
            created_at: brands[6].created_at,
            id: brands[6].id,
            name: brands[6].name,
            updated_at: brands[6].updated_at,
          },
          created_at: models[6].created_at,
          id: models[6].id,
          name: models[6].name,
          updated_at: models[6].updated_at,
        },
        {
          brand: {
            created_at: brands[7].created_at,
            id: brands[7].id,
            name: brands[7].name,
            updated_at: brands[7].updated_at,
          },
          created_at: models[7].created_at,
          id: models[7].id,
          name: models[7].name,
          updated_at: models[7].updated_at,
        },
        {
          brand: {
            created_at: brands[8].created_at,
            id: brands[8].id,
            name: brands[8].name,
            updated_at: brands[8].updated_at,
          },
          created_at: models[8].created_at,
          id: models[8].id,
          name: models[8].name,
          updated_at: models[8].updated_at,
        },
        {
          brand: {
            created_at: brands[9].created_at,
            id: brands[9].id,
            name: brands[9].name,
            updated_at: brands[9].updated_at,
          },
          created_at: models[9].created_at,
          id: models[9].id,
          name: models[9].name,
          updated_at: models[9].updated_at,
        },
      ],
    };
    const secondPage = {
      page_count: 2,
      page: [
        {
          brand: {
            created_at: brands[10].created_at,
            id: brands[10].id,
            name: brands[10].name,
            updated_at: brands[10].updated_at,
          },
          created_at: models[10].created_at,
          id: models[10].id,
          name: models[10].name,
          updated_at: models[10].updated_at,
        },
      ],
    };

    const pagelessResponse = await application.request("/models");
    expect(await pagelessResponse.json()).toEqual(firstPage);
    expect(pagelessResponse.ok).toBe(true);

    const firstPageResponse = await application.request("/models?page=1");
    expect(await firstPageResponse.json()).toEqual(firstPage);
    expect(firstPageResponse.ok).toBe(true);

    const secondPageResponse = await application.request("/models?page=2");
    expect(await secondPageResponse.json()).toEqual(secondPage);
    expect(secondPageResponse.ok).toBe(true);
  });

  it("responds with success and queries the brand name", async () => {
    const { brands, models } = await database.transaction().execute(async (transaction) => {
      const brands: { created_at: Date; id: string; name: string; updated_at: Date }[] = [];
      const models: { created_at: Date; id: string; name: string; updated_at: Date }[] = [];

      for (let index = 1; index <= 11; index++) {
        const brand = await insertBrand(transaction, {
          name: index > 8 ? `Foo Brand ${index}` : `Bar Brand ${index}`,
        });
        brands.push(brand);
        const model = await insertModel(transaction, {
          brand_id: brand.id,
          name: `Model ${index}`,
        });
        models.push(model);
      }

      return { brands, models };
    });

    const firstPage = {
      page_count: 2,
      page: [
        {
          brand: {
            created_at: brands[8].created_at,
            id: brands[8].id,
            name: brands[8].name,
            updated_at: brands[8].updated_at,
          },
          created_at: models[8].created_at,
          id: models[8].id,
          name: models[8].name,
          updated_at: models[8].updated_at,
        },
        {
          brand: {
            created_at: brands[9].created_at,
            id: brands[9].id,
            name: brands[9].name,
            updated_at: brands[9].updated_at,
          },
          created_at: models[9].created_at,
          id: models[9].id,
          name: models[9].name,
          updated_at: models[9].updated_at,
        },
        {
          brand: {
            created_at: brands[10].created_at,
            id: brands[10].id,
            name: brands[10].name,
            updated_at: brands[10].updated_at,
          },
          created_at: models[10].created_at,
          id: models[10].id,
          name: models[10].name,
          updated_at: models[10].updated_at,
        },
        {
          brand: {
            created_at: brands[0].created_at,
            id: brands[0].id,
            name: brands[0].name,
            updated_at: brands[0].updated_at,
          },
          created_at: models[0].created_at,
          id: models[0].id,
          name: models[0].name,
          updated_at: models[0].updated_at,
        },
        {
          brand: {
            created_at: brands[1].created_at,
            id: brands[1].id,
            name: brands[1].name,
            updated_at: brands[1].updated_at,
          },
          created_at: models[1].created_at,
          id: models[1].id,
          name: models[1].name,
          updated_at: models[1].updated_at,
        },
        {
          brand: {
            created_at: brands[2].created_at,
            id: brands[2].id,
            name: brands[2].name,
            updated_at: brands[2].updated_at,
          },
          created_at: models[2].created_at,
          id: models[2].id,
          name: models[2].name,
          updated_at: models[2].updated_at,
        },
        {
          brand: {
            created_at: brands[3].created_at,
            id: brands[3].id,
            name: brands[3].name,
            updated_at: brands[3].updated_at,
          },
          created_at: models[3].created_at,
          id: models[3].id,
          name: models[3].name,
          updated_at: models[3].updated_at,
        },
        {
          brand: {
            created_at: brands[4].created_at,
            id: brands[4].id,
            name: brands[4].name,
            updated_at: brands[4].updated_at,
          },
          created_at: models[4].created_at,
          id: models[4].id,
          name: models[4].name,
          updated_at: models[4].updated_at,
        },
        {
          brand: {
            created_at: brands[5].created_at,
            id: brands[5].id,
            name: brands[5].name,
            updated_at: brands[5].updated_at,
          },
          created_at: models[5].created_at,
          id: models[5].id,
          name: models[5].name,
          updated_at: models[5].updated_at,
        },
        {
          brand: {
            created_at: brands[6].created_at,
            id: brands[6].id,
            name: brands[6].name,
            updated_at: brands[6].updated_at,
          },
          created_at: models[6].created_at,
          id: models[6].id,
          name: models[6].name,
          updated_at: models[6].updated_at,
        },
      ],
    };
    const secondPage = {
      page_count: 2,
      page: [
        {
          brand: {
            created_at: brands[7].created_at,
            id: brands[7].id,
            name: brands[7].name,
            updated_at: brands[7].updated_at,
          },
          created_at: models[7].created_at,
          id: models[7].id,
          name: models[7].name,
          updated_at: models[7].updated_at,
        },
      ],
    };

    const pagelessResponse = await application.request("/models?query=foo");
    expect(await pagelessResponse.json()).toEqual(firstPage);
    expect(pagelessResponse.ok).toBe(true);

    const firstPageResponse = await application.request("/models?query=foo&page=1");
    expect(await firstPageResponse.json()).toEqual(firstPage);
    expect(firstPageResponse.ok).toBe(true);

    const secondPageResponse = await application.request("/models?query=foo&page=2");
    expect(await secondPageResponse.json()).toEqual(secondPage);
    expect(secondPageResponse.ok).toBe(true);
  });

  it("responds with success and queries the name", async () => {
    const { brands, models } = await database.transaction().execute(async (transaction) => {
      const brands: { created_at: Date; id: string; name: string; updated_at: Date }[] = [];
      const models: { created_at: Date; id: string; name: string; updated_at: Date }[] = [];

      for (let index = 1; index <= 11; index++) {
        const brand = await insertBrand(transaction, { name: `Brand ${index}` });
        brands.push(brand);
        const model = await insertModel(transaction, {
          brand_id: brand.id,
          name: index > 8 ? `Foo Model ${index}` : `Bar Model ${index}`,
        });
        models.push(model);
      }

      return { brands, models };
    });

    const firstPage = {
      page_count: 2,
      page: [
        {
          brand: {
            created_at: brands[8].created_at,
            id: brands[8].id,
            name: brands[8].name,
            updated_at: brands[8].updated_at,
          },
          created_at: models[8].created_at,
          id: models[8].id,
          name: models[8].name,
          updated_at: models[8].updated_at,
        },
        {
          brand: {
            created_at: brands[9].created_at,
            id: brands[9].id,
            name: brands[9].name,
            updated_at: brands[9].updated_at,
          },
          created_at: models[9].created_at,
          id: models[9].id,
          name: models[9].name,
          updated_at: models[9].updated_at,
        },
        {
          brand: {
            created_at: brands[10].created_at,
            id: brands[10].id,
            name: brands[10].name,
            updated_at: brands[10].updated_at,
          },
          created_at: models[10].created_at,
          id: models[10].id,
          name: models[10].name,
          updated_at: models[10].updated_at,
        },
        {
          brand: {
            created_at: brands[0].created_at,
            id: brands[0].id,
            name: brands[0].name,
            updated_at: brands[0].updated_at,
          },
          created_at: models[0].created_at,
          id: models[0].id,
          name: models[0].name,
          updated_at: models[0].updated_at,
        },
        {
          brand: {
            created_at: brands[1].created_at,
            id: brands[1].id,
            name: brands[1].name,
            updated_at: brands[1].updated_at,
          },
          created_at: models[1].created_at,
          id: models[1].id,
          name: models[1].name,
          updated_at: models[1].updated_at,
        },
        {
          brand: {
            created_at: brands[2].created_at,
            id: brands[2].id,
            name: brands[2].name,
            updated_at: brands[2].updated_at,
          },
          created_at: models[2].created_at,
          id: models[2].id,
          name: models[2].name,
          updated_at: models[2].updated_at,
        },
        {
          brand: {
            created_at: brands[3].created_at,
            id: brands[3].id,
            name: brands[3].name,
            updated_at: brands[3].updated_at,
          },
          created_at: models[3].created_at,
          id: models[3].id,
          name: models[3].name,
          updated_at: models[3].updated_at,
        },
        {
          brand: {
            created_at: brands[4].created_at,
            id: brands[4].id,
            name: brands[4].name,
            updated_at: brands[4].updated_at,
          },
          created_at: models[4].created_at,
          id: models[4].id,
          name: models[4].name,
          updated_at: models[4].updated_at,
        },
        {
          brand: {
            created_at: brands[5].created_at,
            id: brands[5].id,
            name: brands[5].name,
            updated_at: brands[5].updated_at,
          },
          created_at: models[5].created_at,
          id: models[5].id,
          name: models[5].name,
          updated_at: models[5].updated_at,
        },
        {
          brand: {
            created_at: brands[6].created_at,
            id: brands[6].id,
            name: brands[6].name,
            updated_at: brands[6].updated_at,
          },
          created_at: models[6].created_at,
          id: models[6].id,
          name: models[6].name,
          updated_at: models[6].updated_at,
        },
      ],
    };
    const secondPage = {
      page_count: 2,
      page: [
        {
          brand: {
            created_at: brands[7].created_at,
            id: brands[7].id,
            name: brands[7].name,
            updated_at: brands[7].updated_at,
          },
          created_at: models[7].created_at,
          id: models[7].id,
          name: models[7].name,
          updated_at: models[7].updated_at,
        },
      ],
    };

    const pagelessResponse = await application.request("/models?query=foo");
    expect(await pagelessResponse.json()).toEqual(firstPage);
    expect(pagelessResponse.ok).toBe(true);

    const firstPageResponse = await application.request("/models?query=foo&page=1");
    expect(await firstPageResponse.json()).toEqual(firstPage);
    expect(firstPageResponse.ok).toBe(true);

    const secondPageResponse = await application.request("/models?query=foo&page=2");
    expect(await secondPageResponse.json()).toEqual(secondPage);
    expect(secondPageResponse.ok).toBe(true);
  });
});
