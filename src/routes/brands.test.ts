import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, test } from "vitest";
import { signIn } from "../test_helper.js";
describe("GET /brands", () => {
  test("it works", async () => {
    let brands: { id: string; created_at: Date; updated_at: Date }[] = [];

    await database.transaction().execute(async (transaction) => {
      for (let brandIndex = 1; brandIndex <= 11; brandIndex++) {
        const brand = await transaction
          .insertInto("brands")
          .values({
            name: `Brand ${brandIndex}`,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        brands.push(brand);
        for (let modelIndex = 1; modelIndex <= brandIndex; modelIndex++) {
          await transaction
            .insertInto("models")
            .values({
              brand_id: brand.id,
              name: `Model ${modelIndex}`,
            })
            .returning("id")
            .executeTakeFirstOrThrow();
        }
      }
    });

    let firstPage = {
      page: [
        {
          id: brands[0].id,
          created_at: brands[0].created_at,
          model_count: 1,
          name: "Brand 1",
          updated_at: brands[0].updated_at,
        },
        {
          id: brands[1].id,
          created_at: brands[1].created_at,
          model_count: 2,
          name: "Brand 2",
          updated_at: brands[1].updated_at,
        },
        {
          id: brands[2].id,
          created_at: brands[2].created_at,
          model_count: 3,
          name: "Brand 3",
          updated_at: brands[2].updated_at,
        },
        {
          id: brands[3].id,
          created_at: brands[3].created_at,
          model_count: 4,
          name: "Brand 4",
          updated_at: brands[3].updated_at,
        },
        {
          id: brands[4].id,
          created_at: brands[4].created_at,
          model_count: 5,
          name: "Brand 5",
          updated_at: brands[4].updated_at,
        },
        {
          id: brands[5].id,
          created_at: brands[5].created_at,
          model_count: 6,
          name: "Brand 6",
          updated_at: brands[5].updated_at,
        },
        {
          id: brands[6].id,
          created_at: brands[6].created_at,
          model_count: 7,
          name: "Brand 7",
          updated_at: brands[6].updated_at,
        },
        {
          id: brands[7].id,
          created_at: brands[7].created_at,
          model_count: 8,
          name: "Brand 8",
          updated_at: brands[7].updated_at,
        },
        {
          id: brands[8].id,
          created_at: brands[8].created_at,
          model_count: 9,
          name: "Brand 9",
          updated_at: brands[8].updated_at,
        },
        {
          id: brands[9].id,
          created_at: brands[9].created_at,
          model_count: 10,
          name: "Brand 10",
          updated_at: brands[9].updated_at,
        },
      ],
      page_count: 2,
    };
    let secondPage = {
      page: [
        {
          id: brands[10].id,
          created_at: brands[10].created_at,
          model_count: 11,
          name: "Brand 11",
          updated_at: brands[10].updated_at,
        },
      ],
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
    let brands: { id: string; created_at: Date; updated_at: Date }[] = [];

    await database.transaction().execute(async (transaction) => {
      for (let brandIndex = 1; brandIndex <= 11; brandIndex++) {
        const brand = await transaction
          .insertInto("brands")
          .values({
            name: brandIndex > 8 ? `Foo Brand ${brandIndex}` : `Bar Brand ${brandIndex}`,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        brands.push(brand);
        for (let modelIndex = 1; modelIndex <= brandIndex; modelIndex++) {
          await transaction
            .insertInto("models")
            .values({
              brand_id: brand.id,
              name: `Model ${modelIndex}`,
            })
            .returning("id")
            .executeTakeFirstOrThrow();
        }
      }
    });

    let queryBrandFirstPage = {
      page: [
        {
          id: brands[8].id,
          created_at: brands[8].created_at,
          model_count: 9,
          name: "Foo Brand 9",
          updated_at: brands[8].updated_at,
        },
        {
          id: brands[9].id,
          created_at: brands[9].created_at,
          model_count: 10,
          name: "Foo Brand 10",
          updated_at: brands[9].updated_at,
        },
        {
          id: brands[10].id,
          created_at: brands[10].created_at,
          model_count: 11,
          name: "Foo Brand 11",
          updated_at: brands[10].updated_at,
        },
        {
          id: brands[0].id,
          created_at: brands[0].created_at,
          model_count: 1,
          name: "Bar Brand 1",
          updated_at: brands[0].updated_at,
        },
        {
          id: brands[1].id,
          created_at: brands[1].created_at,
          model_count: 2,
          name: "Bar Brand 2",
          updated_at: brands[1].updated_at,
        },
        {
          id: brands[2].id,
          created_at: brands[2].created_at,
          model_count: 3,
          name: "Bar Brand 3",
          updated_at: brands[2].updated_at,
        },
        {
          id: brands[3].id,
          created_at: brands[3].created_at,
          model_count: 4,
          name: "Bar Brand 4",
          updated_at: brands[3].updated_at,
        },
        {
          id: brands[4].id,
          created_at: brands[4].created_at,
          model_count: 5,
          name: "Bar Brand 5",
          updated_at: brands[4].updated_at,
        },
        {
          id: brands[5].id,
          created_at: brands[5].created_at,
          model_count: 6,
          name: "Bar Brand 6",
          updated_at: brands[5].updated_at,
        },
        {
          id: brands[6].id,
          created_at: brands[6].created_at,
          model_count: 7,
          name: "Bar Brand 7",
          updated_at: brands[6].updated_at,
        },
      ],
      page_count: 2,
    };
    let queryBrandSecondPage = {
      page: [
        {
          id: brands[7].id,
          created_at: brands[7].created_at,
          model_count: 8,
          name: "Bar Brand 8",
          updated_at: brands[7].updated_at,
        },
      ],
      page_count: 2,
    };

    const user = await database.transaction().execute(async (transaction) => {
      return await transaction
        .insertInto("users")
        .values({
          email: "test@test.com",
          display_name: "Test User",
          scoring_system: "five_star",
          username: "test_user",
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    });

    const { accessToken } = await signIn(user.id);

    const pagelessResponse = await application.request("/brands?query=foo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(await pagelessResponse.json()).toEqual(queryBrandFirstPage);
    expect(pagelessResponse.ok).toBe(true);

    const firstPageResponse = await application.request("/brands?query=foo&page=1", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(await firstPageResponse.json()).toEqual(queryBrandFirstPage);
    expect(firstPageResponse.ok).toBe(true);

    const secondPageResponse = await application.request("/brands?query=foo&page=2", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(await secondPageResponse.json()).toEqual(queryBrandSecondPage);
    expect(secondPageResponse.ok).toBe(true);
  });
});
