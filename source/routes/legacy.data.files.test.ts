import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertMeasurement } from "../test_helper.factories.js";

describe("GET /legacy/data/:file_name", () => {
  it("responds with success and returns the left channel measurement", async () => {
    const { measurement } = await database.transaction().execute(async (transaction) => {
      const measurement = await insertMeasurement(transaction);

      return { measurement };
    });

    const response = await application.request(`/legacy/data/${measurement.id} L.txt`);
    expect(await response.text()).toEqual(measurement.left_channel);
    expect(response.ok).toBe(true);
  });

  it("responds with success and returns the right channel measurement", async () => {
    const { measurement } = await database.transaction().execute(async (transaction) => {
      const measurement = await insertMeasurement(transaction);

      return { measurement };
    });

    const response = await application.request(`/legacy/data/${measurement.id} R.txt`);
    expect(await response.text()).toEqual(measurement.right_channel);
    expect(response.ok).toBe(true);
  });

  it("responds with not found if the measurement does not exist", async () => {
    const response = await application.request(
      `/legacy/data/67e1a0b0-d2a9-4f71-bf21-76b2ace7657e L.txt`,
    );
    expect(response.status).toBe(404);
  });
});
