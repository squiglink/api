import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { getRandomEmail } from "../test_helper.js";
import application from "../application.js";

describe("GET /models/:id/measurements", () => {
  it("responds with success and returns measurements", async () => {
    let brandId: string = "";
    let databaseId: string = "";
    let measurements: { id: string; created_at: Date; updated_at: Date }[] = [];
    let modelId: string = "";
    let userId: string = "";

    await database.transaction().execute(async (transaction) => {
      userId = (
        await transaction
          .insertInto("users")
          .values({
            display_name: `User`,
            email: getRandomEmail(),
            scoring_system: "five_star",
            username: `user`,
          })
          .returning("id")
          .executeTakeFirstOrThrow()
      ).id;
      databaseId = (
        await transaction
          .insertInto("databases")
          .values({ kind: "earbuds", path: "/", user_id: userId })
          .returning("id")
          .executeTakeFirstOrThrow()
      ).id;
      brandId = (
        await transaction
          .insertInto("brands")
          .values({
            name: `Brand`,
          })
          .returning("id")
          .executeTakeFirstOrThrow()
      ).id;
      modelId = (
        await transaction
          .insertInto("models")
          .values({
            brand_id: brandId,
            name: `Model`,
          })
          .returning("id")
          .executeTakeFirstOrThrow()
      ).id;

      for (let measurementIndex = 1; measurementIndex <= 2; measurementIndex++) {
        const measurement = await transaction
          .insertInto("measurements")
          .values({
            database_id: databaseId,
            kind: "frequency_response",
            label: `Label ${measurementIndex}`,
            left_channel: "123",
            model_id: modelId,
            right_channel: "123",
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        measurements.push(measurement);
      }
    });

    let body = [
      {
        id: measurements[0].id,
        created_at: measurements[0].created_at,
        database_id: databaseId,
        kind: "frequency_response",
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
        kind: "frequency_response",
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
