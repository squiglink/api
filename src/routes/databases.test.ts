import { application } from "../application.js";
import { describe, expect, test } from "vitest";
import { newDatabase } from "../database.js";

describe("GET /databases", () => {
  test("it works", async () => {
    let userIds = [];
    let databaseIds = [];

    for (let index = 1; index <= 11; index++) {
      const database = newDatabase();
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
    expect(pagelessResponse.ok).toBe(true);
    expect(await pagelessResponse.json()).toEqual(firstPage);

    const firstPageResponse = await application.request("/databases?page=1");
    expect(firstPageResponse.ok).toBe(true);
    expect(await firstPageResponse.json()).toEqual(firstPage);

    const secondPageResponse = await application.request("/databases?page=2");
    expect(secondPageResponse.ok).toBe(true);
    expect(await secondPageResponse.json()).toEqual(secondPage);
  });
});
