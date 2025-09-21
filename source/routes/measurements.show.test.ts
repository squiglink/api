import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertMeasurement } from "../test_helper.factories.js";

describe("GET /measurements/:id", () => {
  it("responds with success and returns the measurement", async () => {
    const measurement = await database.transaction().execute(async (transaction) => {
      return await insertMeasurement(transaction);
    });

    const body = {
      created_at: measurement.created_at,
      database_id: measurement.database_id,
      id: measurement.id,
      kind: measurement.kind,
      label: measurement.label,
      left_channel: measurement.left_channel,
      model_id: measurement.model_id,
      right_channel: measurement.right_channel,
      updated_at: measurement.updated_at,
    };

    const response = await application.request(`/measurements/${measurement.id}`);
    expect(await response.json()).toEqual(body);
    expect(response.ok).toBe(true);
  });
});
