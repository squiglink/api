import { count } from "../test_helper.js";
import { database } from "../database.js";
import { describe, expect, test } from "vitest";
import { getRandomEmail } from "../test_helper.js";
import { signIn } from "../test_helper.js";
import application from "../application.js";

describe("POST /brands/new", () => {
  test("responds with success and creates a new brand", async () => {
    const user = await database.transaction().execute(async (transaction) => {
      return await transaction
        .insertInto("users")
        .values({
          display_name: "Test User",
          email: getRandomEmail(),
          scoring_system: "five_star",
          username: "test",
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    });

    const { accessToken } = await signIn(user.id);

    let body = { name: "Brand" };

    const response = await application.request("/brands/new", {
      body: JSON.stringify(body),
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(await response.json()).toMatchObject(body);
    expect(await count("brands")).toEqual(1);
    expect(response.ok).toBe(true);
  });
});
