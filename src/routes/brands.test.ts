import { application } from "../application.js";
import { database } from "../database.js";
import { describe, expect, test } from "vitest";

describe("GET /brands", () => {
  test("it works", async () => {
    let brandIds = [];

    for (let brandIndex = 1; brandIndex <= 11; brandIndex++) {
      const { id: brandId } = await database
        .insertInto("brands")
        .values({
          name: `Brand ${brandIndex}`,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      brandIds.push(brandId);
      for (let modelIndex = 1; modelIndex <= brandIndex; modelIndex++) {
        await database
          .insertInto("models")
          .values({
            brand_id: brandId,
            name: `Model ${modelIndex}`,
            shop_url: "https://squig.link",
          })
          .returning("id")
          .executeTakeFirstOrThrow();
      }
    }

    let firstPage = {
      page: [
        { id: brandIds[0], name: "Brand 1", model_count: 1 },
        { id: brandIds[1], name: "Brand 2", model_count: 2 },
        { id: brandIds[2], name: "Brand 3", model_count: 3 },
        { id: brandIds[3], name: "Brand 4", model_count: 4 },
        { id: brandIds[4], name: "Brand 5", model_count: 5 },
        { id: brandIds[5], name: "Brand 6", model_count: 6 },
        { id: brandIds[6], name: "Brand 7", model_count: 7 },
        { id: brandIds[7], name: "Brand 8", model_count: 8 },
        { id: brandIds[8], name: "Brand 9", model_count: 9 },
        { id: brandIds[9], name: "Brand 10", model_count: 10 },
      ],
      page_count: 2,
    };
    let secondPage = {
      page: [{ id: brandIds[10], name: "Brand 11", model_count: 11 }],
      page_count: 2,
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
});
