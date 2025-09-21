import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import { insertEvaluation, insertModel, insertUser } from "../test_helper.factories.js";
import { signIn } from "../test_helper.js";
import application from "../application.js";

describe("PATCH /evaluations/:id", () => {
  it("responds with success and updates an evaluation", async () => {
    const { evaluationId, modelId, userId } = await database
      .transaction()
      .execute(async (transaction) => {
        const modelId = (await insertModel(transaction)).id;
        const userId = (await insertUser(transaction)).id;
        const evaluationId = (await insertEvaluation(transaction, { model_id: modelId })).id;

        return { evaluationId, modelId, userId };
      });

    const { accessToken } = await signIn(userId);
    const body = {
      model_id: modelId,
      review_score: faker.number.int({ min: 0, max: 5 }),
      review_url: faker.internet.url(),
      shop_url: faker.internet.url(),
    };

    const response = await application.request(`/evaluations/${evaluationId}`, {
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${accessToken}` },
      method: "PATCH",
    });

    expect(await response.json()).toMatchObject(body);
    expect(response.ok).toBe(true);
  });
});
