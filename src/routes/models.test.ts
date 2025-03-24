import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";

describe("GET /models", () => {
  it("responds with success and returns models", async () => {
    let brands: { id: string; created_at: Date; updated_at: Date }[] = [];
    let models: { id: string; created_at: Date; updated_at: Date }[] = [];

    await database.transaction().execute(async (transaction) => {
      for (let index = 1; index <= 11; index++) {
        const brand = await transaction
          .insertInto("brands")
          .values({
            name: `Brand ${index}`,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        brands.push(brand);
        const model = await transaction
          .insertInto("models")
          .values({
            brand_id: brand.id,
            name: `Model ${index}`,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        models.push(model);
      }
    });

    let firstPage = {
      page: [
        {
          id: models[0].id,
          brand: {
            id: brands[0].id,
            created_at: brands[0].created_at,
            name: "Brand 1",
            updated_at: brands[0].updated_at,
          },
          created_at: models[0].created_at,
          name: "Model 1",
          updated_at: models[0].updated_at,
        },
        {
          id: models[1].id,
          brand: {
            id: brands[1].id,
            created_at: brands[1].created_at,
            name: "Brand 2",
            updated_at: brands[1].updated_at,
          },
          created_at: models[1].created_at,
          name: "Model 2",
          updated_at: models[1].updated_at,
        },
        {
          id: models[2].id,
          brand: {
            id: brands[2].id,
            created_at: brands[2].created_at,
            name: "Brand 3",
            updated_at: brands[2].updated_at,
          },
          created_at: models[2].created_at,
          name: "Model 3",
          updated_at: models[2].updated_at,
        },
        {
          id: models[3].id,
          brand: {
            id: brands[3].id,
            created_at: brands[3].created_at,
            name: "Brand 4",
            updated_at: brands[3].updated_at,
          },
          created_at: models[3].created_at,
          name: "Model 4",
          updated_at: models[3].updated_at,
        },
        {
          id: models[4].id,
          brand: {
            id: brands[4].id,
            created_at: brands[4].created_at,
            name: "Brand 5",
            updated_at: brands[4].updated_at,
          },
          created_at: models[4].created_at,
          name: "Model 5",
          updated_at: models[4].updated_at,
        },
        {
          id: models[5].id,
          brand: {
            id: brands[5].id,
            created_at: brands[5].created_at,
            name: "Brand 6",
            updated_at: brands[5].updated_at,
          },
          created_at: models[5].created_at,
          name: "Model 6",
          updated_at: models[5].updated_at,
        },
        {
          id: models[6].id,
          brand: {
            id: brands[6].id,
            created_at: brands[6].created_at,
            name: "Brand 7",
            updated_at: brands[6].updated_at,
          },
          created_at: models[6].created_at,
          name: "Model 7",
          updated_at: models[6].updated_at,
        },
        {
          id: models[7].id,
          brand: {
            id: brands[7].id,
            created_at: brands[7].created_at,
            name: "Brand 8",
            updated_at: brands[7].updated_at,
          },
          created_at: models[7].created_at,
          name: "Model 8",
          updated_at: models[7].updated_at,
        },
        {
          id: models[8].id,
          brand: {
            id: brands[8].id,
            created_at: brands[8].created_at,
            name: "Brand 9",
            updated_at: brands[8].updated_at,
          },
          created_at: models[8].created_at,
          name: "Model 9",
          updated_at: models[8].updated_at,
        },
        {
          id: models[9].id,
          brand: {
            id: brands[9].id,
            created_at: brands[9].created_at,
            name: "Brand 10",
            updated_at: brands[9].updated_at,
          },
          created_at: models[9].created_at,
          name: "Model 10",
          updated_at: models[9].updated_at,
        },
      ],
      page_count: 2,
    };
    let secondPage = {
      page: [
        {
          id: models[10].id,
          brand: {
            id: brands[10].id,
            created_at: brands[10].created_at,
            name: "Brand 11",
            updated_at: brands[10].updated_at,
          },
          created_at: models[10].created_at,
          name: "Model 11",
          updated_at: models[10].updated_at,
        },
      ],
      page_count: 2,
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
    let brands: { id: string; created_at: Date; updated_at: Date }[] = [];
    let models: { id: string; created_at: Date; updated_at: Date }[] = [];

    await database.transaction().execute(async (transaction) => {
      for (let index = 1; index <= 11; index++) {
        const brand = await transaction
          .insertInto("brands")
          .values({
            name: index > 8 ? `Foo Brand ${index}` : `Bar Brand ${index}`,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        brands.push(brand);
        const model = await transaction
          .insertInto("models")
          .values({
            brand_id: brand.id,
            name: `Model ${index}`,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        models.push(model);
      }
    });

    let firstPage = {
      page: [
        {
          id: models[8].id,
          brand: {
            id: brands[8].id,
            created_at: brands[8].created_at,
            name: "Foo Brand 9",
            updated_at: brands[8].updated_at,
          },
          created_at: models[8].created_at,
          name: "Model 9",
          updated_at: models[8].updated_at,
        },
        {
          id: models[9].id,
          brand: {
            id: brands[9].id,
            created_at: brands[9].created_at,
            name: "Foo Brand 10",
            updated_at: brands[9].updated_at,
          },
          created_at: models[9].created_at,
          name: "Model 10",
          updated_at: models[9].updated_at,
        },
        {
          id: models[10].id,
          brand: {
            id: brands[10].id,
            created_at: brands[10].created_at,
            name: "Foo Brand 11",
            updated_at: brands[10].updated_at,
          },
          created_at: models[10].created_at,
          name: "Model 11",
          updated_at: models[10].updated_at,
        },
        {
          id: models[0].id,
          brand: {
            id: brands[0].id,
            created_at: brands[0].created_at,
            name: "Bar Brand 1",
            updated_at: brands[0].updated_at,
          },
          created_at: models[0].created_at,
          name: "Model 1",
          updated_at: models[0].updated_at,
        },
        {
          id: models[1].id,
          brand: {
            id: brands[1].id,
            created_at: brands[1].created_at,
            name: "Bar Brand 2",
            updated_at: brands[1].updated_at,
          },
          created_at: models[1].created_at,
          name: "Model 2",
          updated_at: models[1].updated_at,
        },
        {
          id: models[2].id,
          brand: {
            id: brands[2].id,
            created_at: brands[2].created_at,
            name: "Bar Brand 3",
            updated_at: brands[2].updated_at,
          },
          created_at: models[2].created_at,
          name: "Model 3",
          updated_at: models[2].updated_at,
        },
        {
          id: models[3].id,
          brand: {
            id: brands[3].id,
            created_at: brands[3].created_at,
            name: "Bar Brand 4",
            updated_at: brands[3].updated_at,
          },
          created_at: models[3].created_at,
          name: "Model 4",
          updated_at: models[3].updated_at,
        },
        {
          id: models[4].id,
          brand: {
            id: brands[4].id,
            created_at: brands[4].created_at,
            name: "Bar Brand 5",
            updated_at: brands[4].updated_at,
          },
          created_at: models[4].created_at,
          name: "Model 5",
          updated_at: models[4].updated_at,
        },
        {
          id: models[5].id,
          brand: {
            id: brands[5].id,
            created_at: brands[5].created_at,
            name: "Bar Brand 6",
            updated_at: brands[5].updated_at,
          },
          created_at: models[5].created_at,
          name: "Model 6",
          updated_at: models[5].updated_at,
        },
        {
          id: models[6].id,
          brand: {
            id: brands[6].id,
            created_at: brands[6].created_at,
            name: "Bar Brand 7",
            updated_at: brands[6].updated_at,
          },
          created_at: models[6].created_at,
          name: "Model 7",
          updated_at: models[6].updated_at,
        },
      ],
      page_count: 2,
    };
    let secondPage = {
      page: [
        {
          id: models[7].id,
          brand: {
            id: brands[7].id,
            created_at: brands[7].created_at,
            name: "Bar Brand 8",
            updated_at: brands[7].updated_at,
          },
          created_at: models[7].created_at,
          name: "Model 8",
          updated_at: models[7].updated_at,
        },
      ],
      page_count: 2,
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
    let brands: { id: string; created_at: Date; updated_at: Date }[] = [];
    let models: { id: string; created_at: Date; updated_at: Date }[] = [];

    await database.transaction().execute(async (transaction) => {
      for (let index = 1; index <= 11; index++) {
        const brand = await transaction
          .insertInto("brands")
          .values({
            name: `Brand ${index}`,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        brands.push(brand);
        const model = await transaction
          .insertInto("models")
          .values({
            brand_id: brand.id,
            name: index > 8 ? `Foo Model ${index}` : `Bar Model ${index}`,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        models.push(model);
      }
    });

    let firstPage = {
      page: [
        {
          id: models[8].id,
          brand: {
            id: brands[8].id,
            created_at: brands[8].created_at,
            name: "Brand 9",
            updated_at: brands[8].updated_at,
          },
          created_at: models[8].created_at,
          name: "Foo Model 9",
          updated_at: models[8].updated_at,
        },
        {
          id: models[9].id,
          brand: {
            id: brands[9].id,
            created_at: brands[9].created_at,
            name: "Brand 10",
            updated_at: brands[9].updated_at,
          },
          created_at: models[9].created_at,
          name: "Foo Model 10",
          updated_at: models[9].updated_at,
        },
        {
          id: models[10].id,
          brand: {
            id: brands[10].id,
            created_at: brands[10].created_at,
            name: "Brand 11",
            updated_at: brands[10].updated_at,
          },
          created_at: models[10].created_at,
          name: "Foo Model 11",
          updated_at: models[10].updated_at,
        },
        {
          id: models[0].id,
          brand: {
            id: brands[0].id,
            created_at: brands[0].created_at,
            name: "Brand 1",
            updated_at: brands[0].updated_at,
          },
          created_at: models[0].created_at,
          name: "Bar Model 1",
          updated_at: models[0].updated_at,
        },
        {
          id: models[1].id,
          brand: {
            id: brands[1].id,
            created_at: brands[1].created_at,
            name: "Brand 2",
            updated_at: brands[1].updated_at,
          },
          created_at: models[1].created_at,
          name: "Bar Model 2",
          updated_at: models[1].updated_at,
        },
        {
          id: models[2].id,
          brand: {
            id: brands[2].id,
            created_at: brands[2].created_at,
            name: "Brand 3",
            updated_at: brands[2].updated_at,
          },
          created_at: models[2].created_at,
          name: "Bar Model 3",
          updated_at: models[2].updated_at,
        },
        {
          id: models[3].id,
          brand: {
            id: brands[3].id,
            created_at: brands[3].created_at,
            name: "Brand 4",
            updated_at: brands[3].updated_at,
          },
          created_at: models[3].created_at,
          name: "Bar Model 4",
          updated_at: models[3].updated_at,
        },
        {
          id: models[4].id,
          brand: {
            id: brands[4].id,
            created_at: brands[4].created_at,
            name: "Brand 5",
            updated_at: brands[4].updated_at,
          },
          created_at: models[4].created_at,
          name: "Bar Model 5",
          updated_at: models[4].updated_at,
        },
        {
          id: models[5].id,
          brand: {
            id: brands[5].id,
            created_at: brands[5].created_at,
            name: "Brand 6",
            updated_at: brands[5].updated_at,
          },
          created_at: models[5].created_at,
          name: "Bar Model 6",
          updated_at: models[5].updated_at,
        },
        {
          id: models[6].id,
          brand: {
            id: brands[6].id,
            created_at: brands[6].created_at,
            name: "Brand 7",
            updated_at: brands[6].updated_at,
          },
          created_at: models[6].created_at,
          name: "Bar Model 7",
          updated_at: models[6].updated_at,
        },
      ],
      page_count: 2,
    };
    let secondPage = {
      page: [
        {
          id: models[7].id,
          brand: {
            id: brands[7].id,
            created_at: brands[7].created_at,
            name: "Brand 8",
            updated_at: brands[7].updated_at,
          },
          created_at: models[7].created_at,
          name: "Bar Model 8",
          updated_at: models[7].updated_at,
        },
      ],
      page_count: 2,
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
