import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertDatabase, insertMeasurement, insertModel } from "../test_helper.factories.js";
import application from "../application.js";

describe("GET /measurements", () => {
  it("responds with success and returns measurements", async () => {
    const { databaseId, measurements, modelId } = await database
      .transaction()
      .execute(async (transaction) => {
        const databaseId = (await insertDatabase(transaction)).id;
        const measurements: {
          created_at: Date;
          id: string;
          kind: string;
          label: string;
          updated_at: Date;
        }[] = [];
        const modelId = (await insertModel(transaction)).id;

        for (let measurementIndex = 1; measurementIndex <= 2; measurementIndex++) {
          measurements.push(
            await insertMeasurement(transaction, {
              database_id: databaseId,
              model_id: modelId,
            }),
          );
        }

        return { databaseId, measurements, modelId };
      });

    const body = [
      {
        created_at: measurements[0].created_at,
        database_id: databaseId,
        id: measurements[0].id,
        kind: measurements[0].kind,
        label: measurements[0].label,
        model_id: modelId,
        updated_at: measurements[0].updated_at,
      },
      {
        created_at: measurements[1].created_at,
        database_id: databaseId,
        id: measurements[1].id,
        kind: measurements[1].kind,
        label: measurements[1].label,
        model_id: modelId,
        updated_at: measurements[1].updated_at,
      },
    ];

    const pagelessResponse = await application.request(
      `/measurements?database_id=${databaseId}&model_id=${modelId}`,
    );
    expect(await pagelessResponse.json()).toEqual(body);
    expect(pagelessResponse.ok).toBe(true);
  });

  it("responds with bad request if the database ID is not provided", async () => {
    const modelId = await database.transaction().execute(async (transaction) => {
      const databaseId = (await insertDatabase(transaction)).id;
      const measurements: { created_at: Date; id: string; kind: string; updated_at: Date }[] = [];
      const modelId = (await insertModel(transaction)).id;

      for (let measurementIndex = 1; measurementIndex <= 2; measurementIndex++) {
        measurements.push(
          await insertMeasurement(transaction, {
            database_id: databaseId,
            model_id: modelId,
          }),
        );
      }

      return modelId;
    });

    const body = { error: "The database ID is not provided." };

    const pagelessResponse = await application.request(`/measurements?&model_id=${modelId}`);
    expect(await pagelessResponse.json()).toEqual(body);
    expect(pagelessResponse.status).toBe(400);
  });

  it("responds with bad request if the model ID is not provided", async () => {
    const databaseId = await database.transaction().execute(async (transaction) => {
      const databaseId = (await insertDatabase(transaction)).id;
      const measurements: { created_at: Date; id: string; kind: string; updated_at: Date }[] = [];
      const modelId = (await insertModel(transaction)).id;

      for (let measurementIndex = 1; measurementIndex <= 2; measurementIndex++) {
        measurements.push(
          await insertMeasurement(transaction, {
            database_id: databaseId,
            model_id: modelId,
          }),
        );
      }

      return databaseId;
    });

    const body = { error: "The model ID is not provided." };

    const pagelessResponse = await application.request(`/measurements?database_id=${databaseId}`);
    expect(await pagelessResponse.json()).toEqual(body);
    expect(pagelessResponse.status).toBe(400);
  });
});
