import { count, signIn } from "../test_helper.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertDatabase, insertModel, insertUser } from "../test_helper.factories.js";
import application from "../application.js";

describe("POST /measurements", () => {
  it("responds with success and creates a measurement", async () => {
    const { databaseId, modelId, userId } = await database
      .transaction()
      .execute(async (transaction) => {
        const userId = (await insertUser(transaction)).id;
        const databaseId = (await insertDatabase(transaction, { user_id: userId })).id;
        const modelId = (await insertModel(transaction)).id;

        return { databaseId, modelId, userId };
      });

    const { accessToken } = await signIn(userId);
    const body = {
      database_id: databaseId,
      kind: "frequency_response",
      label: "Label",
      left_channel: "1.2, 3.4\n5.6, 7.8\n",
      model_id: modelId,
      right_channel: "2.3, 4.5\n6.7, 8.9\n",
    };

    const response = await application.request("/measurements", {
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${accessToken}` },
      method: "POST",
    });

    expect(await response.json()).toMatchObject(body);
    expect(await count("models")).toEqual(1);
    expect(response.status).toBe(200);
  });

  it("responds with unauthorized if trying to create a measurement in another user's database", async () => {
    const { databaseId, modelId } = await database.transaction().execute(async (transaction) => {
      const databaseId = (await insertDatabase(transaction)).id;
      const modelId = (await insertModel(transaction)).id;

      return { databaseId, modelId };
    });

    const { accessToken } = await signIn();
    const body = {
      database_id: databaseId,
      kind: "frequency_response",
      label: "Test Label",
      left_channel: "1.2, 3.4\n5.6, 7.8\n",
      model_id: modelId,
      right_channel: "2.3, 4.5\n6.7, 8.9\n",
    };

    const response = await application.request("/measurements", {
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${accessToken}` },
      method: "POST",
    });

    expect(response.status).toBe(401);
  });
});
