import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "bun:test";
import {
  insertDatabase,
  insertMeasurement,
  insertModel,
  insertUser,
} from "../test_helper.factories.js";
import { signIn } from "../test_helper.js";

describe("PATCH /measurements/:id", () => {
  it("responds with bad request if neither the left channel nor the right channel would be present after the update", async () => {
    const { measurementId, userId } = await database.transaction().execute(async (transaction) => {
      const userId = (await insertUser(transaction)).id;
      const databaseId = (await insertDatabase(transaction, { user_id: userId })).id;
      const measurementId = (
        await insertMeasurement(transaction, { database_id: databaseId, right_channel: null })
      ).id;

      return { measurementId, userId };
    });

    const { accessToken } = await signIn(userId);

    const response = await application.request(`/measurements/${measurementId}`, {
      body: JSON.stringify({ left_channel: null }),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    });

    expect(response.status).toBe(400);
  });

  it("responds with success and updates a measurement", async () => {
    const { databaseId, measurementId, modelId, userId } = await database
      .transaction()
      .execute(async (transaction) => {
        const userId = (await insertUser(transaction)).id;
        const databaseId = (await insertDatabase(transaction, { user_id: userId })).id;
        const modelId = (await insertModel(transaction)).id;
        const measurementId = (
          await insertMeasurement(transaction, { database_id: databaseId, model_id: modelId })
        ).id;

        return { databaseId, measurementId, modelId, userId };
      });

    const { accessToken } = await signIn(userId);
    const body = {
      database_id: databaseId,
      kind: "frequency_response",
      label: "placeholder",
      left_channel: "1.2, 3.4\n5.6, 7.8\n",
      model_id: modelId,
      right_channel: "2.3, 4.5\n6.7, 8.9\n",
    };

    const response = await application.request(`/measurements/${measurementId}`, {
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

  it("responds with unauthorized if the database belongs to another user", async () => {
    const { databaseId, measurementId, modelId } = await database
      .transaction()
      .execute(async (transaction) => {
        const databaseId = (await insertDatabase(transaction)).id;
        const measurementId = (await insertMeasurement(transaction)).id;
        const modelId = (await insertModel(transaction)).id;

        return { databaseId, measurementId, modelId };
      });

    const { accessToken } = await signIn();
    const body = {
      database_id: databaseId,
      kind: "frequency_response",
      label: "placeholder",
      left_channel: "1.2, 3.4\n5.6, 7.8\n",
      model_id: modelId,
      right_channel: "2.3, 4.5\n6.7, 8.9\n",
    };

    const response = await application.request(`/measurements/${measurementId}`, {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    });

    expect(response.status).toBe(403);
  });
});
