import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "bun:test";
import { insertModel, insertUser } from "../test_helper.factories.js";
import { signIn } from "../test_helper.js";

describe("PATCH /models/:id", () => {
  it("responds with forbidden if the user does not have the root role", async () => {
    const { modelId } = await database.transaction().execute(async (transaction) => {
      return { modelId: (await insertModel(transaction)).id };
    });

    const { accessToken } = await signIn();
    const body = { name: "placeholder" };

    const response = await application.request(`/models/${modelId}`, {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    });

    expect(response.status).toBe(403);
  });

  it("responds with success and updates a model", async () => {
    const { modelId, userId } = await database.transaction().execute(async (transaction) => {
      const modelId = (await insertModel(transaction)).id;
      const userId = (await insertUser(transaction, { role: "root" })).id;

      return { modelId, userId };
    });

    const { accessToken } = await signIn(userId);
    const body = { name: "placeholder" };

    const response = await application.request(`/models/${modelId}`, {
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
