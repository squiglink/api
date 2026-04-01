import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "bun:test";
import { insertUser } from "../test_helper.factories.js";

describe("GET /users/:id", () => {
  it("responds with success and returns the user", async () => {
    const user = await database.transaction().execute(async (transaction) => {
      return await insertUser(transaction);
    });

    const body = {
      created_at: user.created_at.toISOString(),
      display_name: user.display_name,
      email: user.email,
      id: user.id,
      scoring_system: user.scoring_system,
      updated_at: user.updated_at.toISOString(),
      username: user.username,
    };

    const response = await application.request(`/users/${user.id}`);
    expect(await response.json()).toEqual(body);
    expect(response.ok).toBe(true);
  });
});
