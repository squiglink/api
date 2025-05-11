import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import {
  insertDatabase,
  insertMeasurement,
  insertModel,
  insertUser,
} from "../test_helper.factories.js";
import { signIn } from "../test_helper.js";
import application from "../application.js";

describe("PATCH /measurements/:id/edit", () => {
  it("responds with success and edits a measurement", async () => {
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
      label: "Label",
      left_channel: "123",
      model_id: modelId,
      right_channel: "123",
    };

    const response = await application.request(`/measurements/${measurementId}/edit`, {
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${accessToken}` },
      method: "PATCH",
    });

    expect(await response.json()).toMatchObject(body);
    expect(response.ok).toBe(true);
  });

  it("responds with unauthorized if trying to edit a measurement in another user's database", async () => {
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
      label: "Label",
      left_channel: "123",
      model_id: modelId,
      right_channel: "123",
    };

    const response = await application.request(`/measurements/${measurementId}/edit`, {
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${accessToken}` },
      method: "PATCH",
    });

    expect(response.status).toBe(401);
  });
});
