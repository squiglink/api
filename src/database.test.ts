import { aw } from "vitest/dist/chunks/reporters.D7Jzd9GS.js";
import { application } from "./application.js";
import { database, touch } from "./database.js";
import { count } from "./test_helper.js";
import { describe, expect, test } from "vitest";

describe("touch", () => {
  test("it refreshes timestamp in the updated_at column", async () => {
    const createdBrand = await database
      .insertInto("brands")
      .values({ name: "Zony" })
      .returningAll()
      .executeTakeFirstOrThrow();

    const updatedBrand = await database
      .updateTable("brands")
      .set(touch)
      .where("id", "=", createdBrand.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    expect(updatedBrand.updated_at).toBeGreaterThan(createdBrand.updated_at.getTime());
  });
});
