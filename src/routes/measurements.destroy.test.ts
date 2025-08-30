import { count, signIn } from "../test_helper.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import {
  insertDatabase,
  insertMeasurement,
  insertModel,
  insertUser,
} from "../test_helper.factories.js";
import application from "../application.js";

describe("DELETE /measurements/:id", () => {
  it("responds with success and destroys a measurement", async () => {
    const { measurementId, userId } = await database.transaction().execute(async (transaction) => {
      const userId = (await insertUser(transaction)).id;
      const databaseId = (await insertDatabase(transaction, { user_id: userId })).id;
      const modelId = (await insertModel(transaction)).id;
      const measurementId = (
        await insertMeasurement(transaction, { database_id: databaseId, model_id: modelId })
      ).id;

      return { measurementId, userId };
    });

    const { accessToken } = await signIn(userId);

    const response = await application.request(`/measurements/${measurementId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      method: "DELETE",
    });

    expect(response.status).toBe(200);
    expect(await count("measurements")).toEqual(0);
  });

  it("responds with not found if the measurement does not exist", async () => {
    const { accessToken } = await signIn();

    const response = await application.request(
      "/measurements/00000000-0000-0000-0000-000000000000",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        method: "DELETE",
      },
    );

    expect(response.status).toBe(404);
  });

  it("responds with unauthorized if trying to destroy a measurement in another user's database", async () => {
    const { measurementId } = await database.transaction().execute(async (transaction) => {
      const databaseId = (await insertDatabase(transaction)).id;
      const modelId = (await insertModel(transaction)).id;
      const measurementId = (
        await insertMeasurement(transaction, { database_id: databaseId, model_id: modelId })
      ).id;

      return { measurementId };
    });

    const { accessToken } = await signIn();

    const response = await application.request(`/measurements/${measurementId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      method: "DELETE",
    });

    expect(response.status).toBe(401);
    expect(await count("measurements")).toEqual(1);
  });
});
