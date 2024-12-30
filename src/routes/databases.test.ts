import { application } from "../application.js";
import { database } from "../database.js";
import { describe, expect, test } from "vitest";

describe("GET /databases", () => {
  test("it works", async () => {
    let userIds = [];
    let databaseIds = [];

    for (let index = 1; index <= 11; index++) {
      const { id: userId } = await database
        .insertInto("users")
        .values({
          display_name: `User ${index}`,
          scoring_system: "five_star",
          username: `foo_${index}`,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      userIds.push(userId);
      const { id: databaseId } = await database
        .insertInto("databases")
        .values({ kind: "earbuds", path: "/", user_id: userId })
        .returning("id")
        .executeTakeFirstOrThrow();
      databaseIds.push(databaseId);
    }

    let firstPage = {
      page: [
        { id: databaseIds[0], kind: "earbuds", path: "/", user_id: userIds[0] },
        { id: databaseIds[1], kind: "earbuds", path: "/", user_id: userIds[1] },
        { id: databaseIds[2], kind: "earbuds", path: "/", user_id: userIds[2] },
        { id: databaseIds[3], kind: "earbuds", path: "/", user_id: userIds[3] },
        { id: databaseIds[4], kind: "earbuds", path: "/", user_id: userIds[4] },
        { id: databaseIds[5], kind: "earbuds", path: "/", user_id: userIds[5] },
        { id: databaseIds[6], kind: "earbuds", path: "/", user_id: userIds[6] },
        { id: databaseIds[7], kind: "earbuds", path: "/", user_id: userIds[7] },
        { id: databaseIds[8], kind: "earbuds", path: "/", user_id: userIds[8] },
        { id: databaseIds[9], kind: "earbuds", path: "/", user_id: userIds[9] },
      ],
      page_count: 2,
    };
    let secondPage = {
      page: [
        {
          id: databaseIds[10],
          kind: "earbuds",
          path: "/",
          user_id: userIds[10],
        },
      ],
      page_count: 2,
    };

    const pagelessResponse = await application.request("/databases");
    expect(await pagelessResponse.json()).toEqual(firstPage);
    expect(pagelessResponse.ok).toBe(true);

    const firstPageResponse = await application.request("/databases?page=1");
    expect(await firstPageResponse.json()).toEqual(firstPage);
    expect(firstPageResponse.ok).toBe(true);

    const secondPageResponse = await application.request("/databases?page=2");
    expect(await secondPageResponse.json()).toEqual(secondPage);
    expect(secondPageResponse.ok).toBe(true);
  });

  test("it queries kind", async () => {
    let userIds = [];
    let databaseIds = [];

    for (let index = 1; index <= 11; index++) {
      const { id: userId } = await database
        .insertInto("users")
        .values({
          display_name: `User ${index}`,
          scoring_system: "five_star",
          username: `foo_${index}`,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      userIds.push(userId);
      const { id: databaseId } = await database
        .insertInto("databases")
        .values({
          kind: index > 8 ? "earbuds" : "headphones",
          path: "/",
          user_id: userId,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      databaseIds.push(databaseId);
    }

    let firstPage = {
      page: [
        { id: databaseIds[8], kind: "earbuds", path: "/", user_id: userIds[8] },
        { id: databaseIds[9], kind: "earbuds", path: "/", user_id: userIds[9] },
        {
          id: databaseIds[10],
          kind: "earbuds",
          path: "/",
          user_id: userIds[10],
        },
        {
          id: databaseIds[0],
          kind: "headphones",
          path: "/",
          user_id: userIds[0],
        },
        {
          id: databaseIds[1],
          kind: "headphones",
          path: "/",
          user_id: userIds[1],
        },
        {
          id: databaseIds[2],
          kind: "headphones",
          path: "/",
          user_id: userIds[2],
        },
        {
          id: databaseIds[3],
          kind: "headphones",
          path: "/",
          user_id: userIds[3],
        },
        {
          id: databaseIds[4],
          kind: "headphones",
          path: "/",
          user_id: userIds[4],
        },
        {
          id: databaseIds[5],
          kind: "headphones",
          path: "/",
          user_id: userIds[5],
        },
        {
          id: databaseIds[6],
          kind: "headphones",
          path: "/",
          user_id: userIds[6],
        },
      ],
      page_count: 2,
    };
    let secondPage = {
      page: [
        {
          id: databaseIds[7],
          kind: "headphones",
          path: "/",
          user_id: userIds[7],
        },
      ],
      page_count: 2,
    };

    const pagelessResponse = await application.request(
      "/databases?query=earbuds",
    );
    expect(await pagelessResponse.json()).toEqual(firstPage);
    expect(pagelessResponse.ok).toBe(true);

    const firstPageResponse = await application.request(
      "/databases?query=earbuds?page=1",
    );
    expect(await firstPageResponse.json()).toEqual(firstPage);
    expect(firstPageResponse.ok).toBe(true);

    const secondPageResponse = await application.request(
      "/databases?query=earbuds?page=2",
    );
    expect(await secondPageResponse.json()).toEqual(secondPage);
    expect(secondPageResponse.ok).toBe(true);
  });

  test("it queries path", async () => {
    let userIds = [];
    let databaseIds = [];

    for (let index = 1; index <= 11; index++) {
      const { id: userId } = await database
        .insertInto("users")
        .values({
          display_name: `User ${index}`,
          scoring_system: "five_star",
          username: `foo_${index}`,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      userIds.push(userId);
      const { id: databaseId } = await database
        .insertInto("databases")
        .values({
          kind: "earbuds",
          path: index > 8 ? "/foo" : "/bar",
          user_id: userId,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      databaseIds.push(databaseId);
    }

    let firstPage = {
      page: [
        {
          id: databaseIds[8],
          kind: "earbuds",
          path: "/foo",
          user_id: userIds[8],
        },
        {
          id: databaseIds[9],
          kind: "earbuds",
          path: "/foo",
          user_id: userIds[9],
        },
        {
          id: databaseIds[10],
          kind: "earbuds",
          path: "/foo",
          user_id: userIds[10],
        },
        {
          id: databaseIds[0],
          kind: "earbuds",
          path: "/bar",
          user_id: userIds[0],
        },
        {
          id: databaseIds[1],
          kind: "earbuds",
          path: "/bar",
          user_id: userIds[1],
        },
        {
          id: databaseIds[2],
          kind: "earbuds",
          path: "/bar",
          user_id: userIds[2],
        },
        {
          id: databaseIds[3],
          kind: "earbuds",
          path: "/bar",
          user_id: userIds[3],
        },
        {
          id: databaseIds[4],
          kind: "earbuds",
          path: "/bar",
          user_id: userIds[4],
        },
        {
          id: databaseIds[5],
          kind: "earbuds",
          path: "/bar",
          user_id: userIds[5],
        },
        {
          id: databaseIds[6],
          kind: "earbuds",
          path: "/bar",
          user_id: userIds[6],
        },
      ],
      page_count: 2,
    };
    let secondPage = {
      page: [
        {
          id: databaseIds[7],
          kind: "earbuds",
          path: "/bar",
          user_id: userIds[7],
        },
      ],
      page_count: 2,
    };

    const pagelessResponse = await application.request("/databases?query=foo");
    expect(await pagelessResponse.json()).toEqual(firstPage);
    expect(pagelessResponse.ok).toBe(true);

    const firstPageResponse = await application.request(
      "/databases?query=foo&page=1",
    );
    expect(await firstPageResponse.json()).toEqual(firstPage);
    expect(firstPageResponse.ok).toBe(true);

    const secondPageResponse = await application.request(
      "/databases?query=foo&page=2",
    );
    expect(await secondPageResponse.json()).toEqual(secondPage);
    expect(secondPageResponse.ok).toBe(true);
  });
});
