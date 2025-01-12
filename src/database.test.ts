import { database, touch } from "./database.js";
import { describe, expect, test } from "vitest";

describe(".touch", () => {
  test("it updates the modification timestamp", async () => {
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

    expect(new Date(updatedBrand.updated_at).getTime()).toBeGreaterThan(
      new Date(createdBrand.updated_at).getTime(),
    );
  });
});
