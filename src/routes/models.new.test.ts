import { application } from "../application.js";
import { database } from "../database.js";
import { describe, expect, test } from "vitest";

describe("POST /models/new", () => {
  test("it works", async () => {
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
    expect(
      (
        await database
          .selectFrom("models")
          .select(database.fn.countAll().as("count"))
          .executeTakeFirstOrThrow()
      ).count,
    ).toEqual(1);
    expect(
      (
        await database
          .selectFrom("evaluations")
          .select(database.fn.countAll().as("count"))
          .executeTakeFirstOrThrow()
      ).count,
    ).toEqual(1);
    expect(
      (
        await database
          .selectFrom("measurements")
          .select(database.fn.countAll().as("count"))
          .executeTakeFirstOrThrow()
      ).count,
    ).toEqual(1);
  });

  test("it works without measurements", async () => {
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
    expect(
      (
        await database
          .selectFrom("models")
          .select(database.fn.countAll().as("count"))
          .executeTakeFirstOrThrow()
      ).count,
    ).toEqual(1);
    expect(
      (
        await database
          .selectFrom("evaluations")
          .select(database.fn.countAll().as("count"))
          .executeTakeFirstOrThrow()
      ).count,
    ).toEqual(1);
  });

  test("it works without an evaluation", async () => {
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
    expect(
      (
        await database
          .selectFrom("models")
          .select(database.fn.countAll().as("count"))
          .executeTakeFirstOrThrow()
      ).count,
    ).toEqual(1);
  });
});
