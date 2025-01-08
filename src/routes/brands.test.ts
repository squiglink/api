import { application } from "../application.js";
import { database } from "../database.js";
import { describe, expect, test } from "vitest";

describe("GET /brands", () => {
  test("it works", async () => {
    let brandIds: number[] = [];

    await database.transaction().execute(async (transaction) => {
      for (let brandIndex = 1; brandIndex <= 11; brandIndex++) {
        const { id: brandId } = await transaction
          .insertInto("brands")
          .values({
            name: `Brand ${brandIndex}`,
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        brandIds.push(Number(brandId));
        for (let modelIndex = 1; modelIndex <= brandIndex; modelIndex++) {
          await transaction
            .insertInto("models")
            .values({
              brand_id: brandId,
              name: `Model ${modelIndex}`,
            })
            .returning("id")
            .executeTakeFirstOrThrow();
        }
      }
    });

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

  test("queries name", async () => {
    let brandIds: number[] = [];

    await database.transaction().execute(async (transaction) => {
      for (let brandIndex = 1; brandIndex <= 11; brandIndex++) {
        const { id: brandId } = await transaction
          .insertInto("brands")
          .values({
            name: brandIndex > 8 ? `Foo Brand ${brandIndex}` : `Bar Brand ${brandIndex}`,
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        brandIds.push(Number(brandId));
        for (let modelIndex = 1; modelIndex <= brandIndex; modelIndex++) {
          await transaction
            .insertInto("models")
            .values({
              brand_id: brandId,
              name: `Model ${modelIndex}`,
            })
            .returning("id")
            .executeTakeFirstOrThrow();
        }
      }
    });

    let queryBrandFirstPage = {
      page: [
        { id: brandIds[8], name: "Foo Brand 9", model_count: 9 },
        { id: brandIds[9], name: "Foo Brand 10", model_count: 10 },
        { id: brandIds[10], name: "Foo Brand 11", model_count: 11 },
        { id: brandIds[0], name: "Bar Brand 1", model_count: 1 },
        { id: brandIds[1], name: "Bar Brand 2", model_count: 2 },
        { id: brandIds[2], name: "Bar Brand 3", model_count: 3 },
        { id: brandIds[3], name: "Bar Brand 4", model_count: 4 },
        { id: brandIds[4], name: "Bar Brand 5", model_count: 5 },
        { id: brandIds[5], name: "Bar Brand 6", model_count: 6 },
        { id: brandIds[6], name: "Bar Brand 7", model_count: 7 },
      ],
      page_count: 2,
    };
    let queryBrandSecondPage = {
      page: [{ id: brandIds[7], name: "Bar Brand 8", model_count: 8 }],
      page_count: 2,
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
