import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertEvaluation, insertModel, insertUser } from "../test_helper.factories.js";
import { signIn } from "../test_helper.js";

describe("PATCH /evaluations/:id", () => {
  it("responds with success and updates an evaluation", async () => {
    const { evaluationId, modelId, userId } = await database
      .transaction()
      .execute(async (transaction) => {
        const modelId = (await insertModel(transaction)).id;
        const userId = (await insertUser(transaction)).id;
        const evaluationId = (
          await insertEvaluation(transaction, { model_id: modelId, user_id: userId })
        ).id;

        return { evaluationId, modelId, userId };
      });

    const { accessToken } = await signIn(userId);
    const body = {
      model_id: modelId,
      review_score: 5,
      review_url: "placeholder",
      shop_url: "placeholder",
    };

    const response = await application.request(`/evaluations/${evaluationId}`, {
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

  it("responds with unauthorized if trying to update another user's evaluation", async () => {
    const { evaluationId, modelId } = await database.transaction().execute(async (transaction) => {
      const modelId = (await insertModel(transaction)).id;
      const evaluationId = (await insertEvaluation(transaction, { model_id: modelId })).id;

      return { evaluationId, modelId };
    });

    const { accessToken } = await signIn();
    const body = {
      model_id: modelId,
      review_score: 5,
      review_url: "placeholder",
      shop_url: "placeholder",
    };

    const response = await application.request(`/evaluations/${evaluationId}`, {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    });

    expect(response.status).toBe(401);
  });
});
