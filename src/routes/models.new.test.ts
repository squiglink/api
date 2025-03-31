import { count } from "../test_helper.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { signIn } from "../test_helper.js";
import application from "../application.js";

describe("POST /models/new", () => {
  it("responds with success and creates a model", async () => {
    let brandId: string = "";
    let userId: string = "";

    await database.transaction().execute(async (transaction) => {
      brandId = (
        await transaction
          .insertInto("brands")
          .values({
            name: `Brand`,
          })
          .returning("id")
          .executeTakeFirstOrThrow()
      ).id;
      userId = (
        await transaction
          .insertInto("users")
          .values({
            display_name: `User`,
            scoring_system: "five_star",
            email: `user@example.com`,
            username: `user`,
          })
          .returning("id")
          .executeTakeFirstOrThrow()
      ).id;
    });

    let body = {
      brand_id: brandId,
      name: "Model",
    };

    const { accessToken } = await signIn(userId);

    const response = await application.request("/models/new", {
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${accessToken}` },
      method: "POST",
    });

    expect(await response.json()).toMatchObject(body);
    expect(await count("models")).toEqual(1);
    expect(response.ok).toBe(true);
  });
});
