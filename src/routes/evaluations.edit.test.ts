import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertEvaluation, insertModel, insertUser } from "../test_helper.factories.js";
import { signIn } from "../test_helper.js";
import application from "../application.js";

describe("PATCH /evaluations/:id/edit", () => {
  it("responds with success and edits an evaluation", async () => {
    const { evaluationId, modelId, userId } = await database
      .transaction()
      .execute(async (transaction) => {
        const modelId = (await insertModel(transaction)).id;
        const userId = (await insertUser(transaction)).id;
        const evaluationId = (await insertEvaluation(transaction, { model_id: modelId })).id;

        return { evaluationId, modelId, userId };
      });

    const { authorizationToken } = await signIn(userId);
    const body = {
      model_id: modelId,
      review_score: 123,
      review_url: "123",
      shop_url: "123",
    };

    const response = await application.request(`/evaluations/${evaluationId}/edit`, {
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${authorizationToken}` },
      method: "PATCH",
    });

    expect(await response.json()).toMatchObject(body);
    expect(response.ok).toBe(true);
  });
});
