import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertDatabase, insertMeasurement, insertModel } from "../test_helper.factories.js";
import application from "../application.js";

describe("GET /models/:id/measurements", () => {
  it("responds with success and returns measurements", async () => {
    const { databaseId, measurements, modelId } = await database
      .transaction()
      .execute(async (transaction) => {
        const databaseId = (await insertDatabase(transaction)).id;
        const measurements: { created_at: Date; id: string; updated_at: Date; kind: string }[] = [];
        const modelId = (await insertModel(transaction)).id;

        for (let measurementIndex = 1; measurementIndex <= 2; measurementIndex++) {
          measurements.push(
            await insertMeasurement(transaction, {
              database_id: databaseId,
              label: `Label ${measurementIndex}`,
              model_id: modelId,
            }),
          );
        }

        return { databaseId, measurements, modelId };
      });

    const body = [
      {
        id: measurements[0].id,
        created_at: measurements[0].created_at,
        database_id: databaseId,
        kind: measurements[0].kind,
        label: "Label 1",
        left_channel: "123",
        model_id: modelId,
        right_channel: "123",
        updated_at: measurements[0].updated_at,
      },
      {
        id: measurements[1].id,
        created_at: measurements[1].created_at,
        database_id: databaseId,
        kind: measurements[1].kind,
        label: "Label 2",
        left_channel: "123",
        model_id: modelId,
        right_channel: "123",
        updated_at: measurements[1].updated_at,
      },
    ];

    const pagelessResponse = await application.request(`/models/${modelId}/measurements`);
    expect(await pagelessResponse.json()).toEqual(body);
    expect(pagelessResponse.ok).toBe(true);
  });
});
