import { application } from "../application.js";
import { database } from "../database.js";
import { describe, expect, test } from "vitest";

describe("GET /models", () => {
  test("it works", async () => {
    let brandIds: number[] = [];
    let modelIds: number[] = [];

    await database.transaction().execute(async (transaction) => {
      for (let index = 1; index <= 11; index++) {
        const { id: brandId } = await transaction
          .insertInto("brands")
          .values({
            name: `Brand ${index}`,
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        brandIds.push(Number(brandId));
        const { id: modelId } = await transaction
          .insertInto("models")
          .values({
            brand_id: brandId,
            name: `Model ${index}`,
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        modelIds.push(Number(modelId));
      }
    });

    let firstPage = {
      page: [
        {
          id: modelIds[0],
          brand: {
            id: brandIds[0],
            name: "Brand 1",
          },
          name: "Model 1",
        },
        {
          id: modelIds[1],
          brand: {
            id: brandIds[1],
            name: "Brand 2",
          },
          name: "Model 2",
        },
        {
          id: modelIds[2],
          brand: {
            id: brandIds[2],
            name: "Brand 3",
          },
          name: "Model 3",
        },
        {
          id: modelIds[3],
          brand: {
            id: brandIds[3],
            name: "Brand 4",
          },
          name: "Model 4",
        },
        {
          id: modelIds[4],
          brand: {
            id: brandIds[4],
            name: "Brand 5",
          },
          name: "Model 5",
        },
        {
          id: modelIds[5],
          brand: {
            id: brandIds[5],
            name: "Brand 6",
          },
          name: "Model 6",
        },
        {
          id: modelIds[6],
          brand: {
            id: brandIds[6],
            name: "Brand 7",
          },
          name: "Model 7",
        },
        {
          id: modelIds[7],
          brand: {
            id: brandIds[7],
            name: "Brand 8",
          },
          name: "Model 8",
        },
        {
          id: modelIds[8],
          brand: {
            id: brandIds[8],
            name: "Brand 9",
          },
          name: "Model 9",
        },
        {
          id: modelIds[9],
          brand: {
            id: brandIds[9],
            name: "Brand 10",
          },
          name: "Model 10",
        },
      ],
      page_count: 2,
    };
    let secondPage = {
      page: [
        {
          id: modelIds[10],
          brand: {
            id: brandIds[10],
            name: "Brand 11",
          },
          name: "Model 11",
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

  test("queries brand name", async () => {
    let brandIds: number[] = [];
    let modelIds: number[] = [];

    await database.transaction().execute(async (transaction) => {
      for (let index = 1; index <= 11; index++) {
        const { id: brandId } = await transaction
          .insertInto("brands")
          .values({
            name: index > 8 ? `Foo Brand ${index}` : `Bar Brand ${index}`,
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        brandIds.push(Number(brandId));
        const { id: modelId } = await transaction
          .insertInto("models")
          .values({
            brand_id: brandId,
            name: `Model ${index}`,
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        modelIds.push(Number(modelId));
      }
    });

    let firstPage = {
      page: [
        {
          id: modelIds[8],
          brand: {
            id: brandIds[8],
            name: "Foo Brand 9",
          },
          name: "Model 9",
        },
        {
          id: modelIds[9],
          brand: {
            id: brandIds[9],
            name: "Foo Brand 10",
          },
          name: "Model 10",
        },
        {
          id: modelIds[10],
          brand: {
            id: brandIds[10],
            name: "Foo Brand 11",
          },
          name: "Model 11",
        },
        {
          id: modelIds[0],
          brand: {
            id: brandIds[0],
            name: "Bar Brand 1",
          },
          name: "Model 1",
        },
        {
          id: modelIds[1],
          brand: {
            id: brandIds[1],
            name: "Bar Brand 2",
          },
          name: "Model 2",
        },
        {
          id: modelIds[2],
          brand: {
            id: brandIds[2],
            name: "Bar Brand 3",
          },
          name: "Model 3",
        },
        {
          id: modelIds[3],
          brand: {
            id: brandIds[3],
            name: "Bar Brand 4",
          },
          name: "Model 4",
        },
        {
          id: modelIds[4],
          brand: {
            id: brandIds[4],
            name: "Bar Brand 5",
          },
          name: "Model 5",
        },
        {
          id: modelIds[5],
          brand: {
            id: brandIds[5],
            name: "Bar Brand 6",
          },
          name: "Model 6",
        },
        {
          id: modelIds[6],
          brand: {
            id: brandIds[6],
            name: "Bar Brand 7",
          },
          name: "Model 7",
        },
      ],
      page_count: 2,
    };
    let secondPage = {
      page: [
        {
          id: modelIds[7],
          brand: {
            id: brandIds[7],
            name: "Bar Brand 8",
          },
          name: "Model 8",
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

  test("queries name", async () => {
    let brandIds: number[] = [];
    let modelIds: number[] = [];

    await database.transaction().execute(async (transaction) => {
      for (let index = 1; index <= 11; index++) {
        const { id: brandId } = await transaction
          .insertInto("brands")
          .values({
            name: `Brand ${index}`,
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        brandIds.push(Number(brandId));
        const { id: modelId } = await transaction
          .insertInto("models")
          .values({
            brand_id: brandId,
            name: index > 8 ? `Foo Model ${index}` : `Bar Model ${index}`,
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        modelIds.push(Number(modelId));
      }
    });

    let firstPage = {
      page: [
        {
          id: modelIds[8],
          brand: {
            id: brandIds[8],
            name: "Brand 9",
          },
          name: "Foo Model 9",
        },
        {
          id: modelIds[9],
          brand: {
            id: brandIds[9],
            name: "Brand 10",
          },
          name: "Foo Model 10",
        },
        {
          id: modelIds[10],
          brand: {
            id: brandIds[10],
            name: "Brand 11",
          },
          name: "Foo Model 11",
        },
        {
          id: modelIds[0],
          brand: {
            id: brandIds[0],
            name: "Brand 1",
          },
          name: "Bar Model 1",
        },
        {
          id: modelIds[1],
          brand: {
            id: brandIds[1],
            name: "Brand 2",
          },
          name: "Bar Model 2",
        },
        {
          id: modelIds[2],
          brand: {
            id: brandIds[2],
            name: "Brand 3",
          },
          name: "Bar Model 3",
        },
        {
          id: modelIds[3],
          brand: {
            id: brandIds[3],
            name: "Brand 4",
          },
          name: "Bar Model 4",
        },
        {
          id: modelIds[4],
          brand: {
            id: brandIds[4],
            name: "Brand 5",
          },
          name: "Bar Model 5",
        },
        {
          id: modelIds[5],
          brand: {
            id: brandIds[5],
            name: "Brand 6",
          },
          name: "Bar Model 6",
        },
        {
          id: modelIds[6],
          brand: {
            id: brandIds[6],
            name: "Brand 7",
          },
          name: "Bar Model 7",
        },
      ],
      page_count: 2,
    };
    let secondPage = {
      page: [
        {
          id: modelIds[7],
          brand: {
            id: brandIds[7],
            name: "Brand 8",
          },
          name: "Bar Model 8",
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
