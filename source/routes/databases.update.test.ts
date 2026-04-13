import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "bun:test";
import { insertDatabase, insertUser } from "../test_helper.factories.js";
import { signIn } from "../test_helper.js";

describe("PATCH /databases/:id", () => {
  it("responds with forbidden if the database belongs to another user", async () => {
    const { databaseId } = await database.transaction().execute(async (transaction) => {
      const databaseId = (await insertDatabase(transaction)).id;

      return { databaseId };
    });

    const { accessToken } = await signIn();
    const body = { path: "placeholder" };

    const response = await application.request(`/databases/${databaseId}`, {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    });

    expect(response.status).toBe(403);
  });

  it("responds with success and updates a database", async () => {
    const { databaseId, userId } = await database.transaction().execute(async (transaction) => {
      const userId = (await insertUser(transaction)).id;
      const databaseId = (await insertDatabase(transaction, { user_id: userId })).id;

      return { databaseId, userId };
    });

    const { accessToken } = await signIn(userId);
    const body = { path: "placeholder" };

    const response = await application.request(`/databases/${databaseId}`, {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    });

    expect(await response.json()).toMatchObject(body);
    expect(response.ok).toBe(true);
  });
});
