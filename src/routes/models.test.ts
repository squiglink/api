import { application } from "../application.js";
import { describe, expect, test } from "vitest";
import { newDatabase } from "../database.js";

describe("GET /models", () => {
  test("it works", async () => {
    const database = newDatabase();

    let brandIds = [];
    let modelIds = [];

    for (let index = 1; index <= 11; index++) {
      const { id: brandId } = await database
        .insertInto("brands")
        .values({
          name: `Brand ${index}`,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      brandIds.push(Number(brandId));
      const { id: modelId } = await database
        .insertInto("models")
        .values({
          brand_id: brandId,
          name: `Model ${index}`,
          shop_url: "https://squig.link",
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      modelIds.push(Number(modelId));
    }

    let firstPage = {
      page: [
        {
          id: modelIds[0],
          brand: {
            id: brandIds[0],
            name: "Brand 1",
          },
          name: "Model 1",
          shop_url: "https://squig.link",
        },
        {
          id: modelIds[1],
          brand: {
            id: brandIds[1],
            name: "Brand 2",
          },
          name: "Model 2",
          shop_url: "https://squig.link",
        },
        {
          id: modelIds[2],
          brand: {
            id: brandIds[2],
            name: "Brand 3",
          },
          name: "Model 3",
          shop_url: "https://squig.link",
        },
        {
          id: modelIds[3],
          brand: {
            id: brandIds[3],
            name: "Brand 4",
          },
          name: "Model 4",
          shop_url: "https://squig.link",
        },
        {
          id: modelIds[4],
          brand: {
            id: brandIds[4],
            name: "Brand 5",
          },
          name: "Model 5",
          shop_url: "https://squig.link",
        },
        {
          id: modelIds[5],
          brand: {
            id: brandIds[5],
            name: "Brand 6",
          },
          name: "Model 6",
          shop_url: "https://squig.link",
        },
        {
          id: modelIds[6],
          brand: {
            id: brandIds[6],
            name: "Brand 7",
          },
          name: "Model 7",
          shop_url: "https://squig.link",
        },
        {
          id: modelIds[7],
          brand: {
            id: brandIds[7],
            name: "Brand 8",
          },
          name: "Model 8",
          shop_url: "https://squig.link",
        },
        {
          id: modelIds[8],
          brand: {
            id: brandIds[8],
            name: "Brand 9",
          },
          name: "Model 9",
          shop_url: "https://squig.link",
        },
        {
          id: modelIds[9],
          brand: {
            id: brandIds[9],
            name: "Brand 10",
          },
          name: "Model 10",
          shop_url: "https://squig.link",
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
          shop_url: "https://squig.link",
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
});
