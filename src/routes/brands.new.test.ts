import { application } from "../application.js";
import { database } from "../database.js";
import { describe, expect, test } from "vitest";

describe("POST /brands/new", () => {
  test("it works", async () => {
    let body = { name: "Brand" };

    const response = await application.request("/brands/new", {
      body: JSON.stringify(body),
      method: "POST",
    });

    expect(await response.json()).toMatchObject(body);
    expect(response.ok).toBe(true);
    expect(
      (
        await database
          .selectFrom("brands")
          .select(database.fn.countAll().as("count"))
          .executeTakeFirstOrThrow()
      ).count,
    ).toEqual(1);
  });
});
