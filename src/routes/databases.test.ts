import { application } from "../application.js";
import { describe, expect, test } from "vitest";
import { newDatabase } from "../database.js";

describe("GET /databases", () => {
  test("it works", async () => {
    const database = newDatabase();
    const { id: userId } = await database
      .insertInto("users")
      .values({
        display_name: "Foo",
        scoring_system: "five_star",
        username: "foo",
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    const { id: databaseId } = await database
      .insertInto("databases")
      .values({ kind: "earbuds", path: "/", user_id: userId })
      .returning("id")
      .executeTakeFirstOrThrow();

    const response = await application.request("/databases");

    expect(response.ok).toBe(true);
    expect(await response.json()).toEqual([
      { id: databaseId, kind: "earbuds", path: "/", user_id: userId },
    ]);
  });
});
