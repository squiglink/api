import { application } from "../application.js";
import { count } from "../test_helper.js";
import { database } from "../database.js";
import { describe, expect, test } from "vitest";

describe("POST /models/new", () => {
  test("creates a new model", async () => {
    let brandId: number = -1;
    let userId: number = -1;
    let databaseId: number = -1;

    await database.transaction().execute(async (transaction) => {
      brandId = Number(
        (
          await transaction
            .insertInto("brands")
            .values({
              name: `Brand`,
            })
            .returning("id")
            .executeTakeFirstOrThrow()
        ).id,
      );
      userId = Number(
        (
          await transaction
            .insertInto("users")
            .values({
              display_name: `User`,
              scoring_system: "five_star",
              username: `user`,
            })
            .returning("id")
            .executeTakeFirstOrThrow()
        ).id,
      );
      databaseId = Number(
        (
          await transaction
            .insertInto("databases")
            .values({ kind: "earbuds", path: "/", user_id: userId })
            .returning("id")
            .executeTakeFirstOrThrow()
        ).id,
      );
    });

    let body = {
      brand_id: brandId,
      name: "Model",
      evaluation: {
        database_id: databaseId,
        measurements: [
          {
            kind: "frequency_response",
            label: "Sample 1",
            left_channel: "123",
            right_channel: "123",
          },
        ],
        review_score: 5,
        review_url: "https://metu.be",
        shop_url: "https://squig.link",
      },
    };

    const response = await application.request("/models/new", {
      body: JSON.stringify(body),
      method: "POST",
    });

    expect(await response.json()).toMatchObject(body);
    expect(response.ok).toBe(true);
    expect(await count("models")).toEqual(1);
    expect(await count("evaluations")).toEqual(1);
    expect(await count("measurements")).toEqual(1);
  });

  test("creates a new model without measurements", async () => {
    const { id: brandId } = await database
      .insertInto("brands")
      .values({
        name: `Brand`,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    const { id: userId } = await database
      .insertInto("users")
      .values({
        display_name: `User`,
        scoring_system: "five_star",
        username: `user`,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    const { id: databaseId } = await database
      .insertInto("databases")
      .values({ kind: "earbuds", path: "/", user_id: userId })
      .returning("id")
      .executeTakeFirstOrThrow();

    let body = {
      brand_id: brandId,
      name: "Model",
      evaluation: {
        database_id: databaseId,
        review_score: 5,
        review_url: "https://metu.be",
        shop_url: "https://squig.link",
      },
    };

    const response = await application.request("/models/new", {
      body: JSON.stringify(body),
      method: "POST",
    });

    expect(await response.json()).toMatchObject(body);
    expect(response.ok).toBe(true);
    expect(await count("models")).toEqual(1);
    expect(await count("evaluations")).toEqual(1);
  });

  test("creates a new model without an evaluation", async () => {
    const { id: brandId } = await database
      .insertInto("brands")
      .values({
        name: `Brand`,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    const { id: userId } = await database
      .insertInto("users")
      .values({
        display_name: `User`,
        scoring_system: "five_star",
        username: `user`,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    const { id: databaseId } = await database
      .insertInto("databases")
      .values({ kind: "earbuds", path: "/", user_id: userId })
      .returning("id")
      .executeTakeFirstOrThrow();

    let body = {
      brand_id: brandId,
      name: "Model",
    };

    const response = await application.request("/models/new", {
      body: JSON.stringify(body),
      method: "POST",
    });

    expect(await response.json()).toMatchObject(body);
    expect(response.ok).toBe(true);
    expect(await count("models")).toEqual(1);
  });
});
