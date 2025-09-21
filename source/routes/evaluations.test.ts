import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertEvaluation } from "../test_helper.factories.js";

describe("GET /evaluations", () => {
  it("responds with success and returns an evaluation", async () => {
    const { evaluation } = await database.transaction().execute(async (transaction) => {
      const evaluation = await insertEvaluation(transaction);

      return { evaluation };
    });

    const body = {
      created_at: evaluation.created_at,
      id: evaluation.id,
      model_id: evaluation.model_id,
      review_score: evaluation.review_score,
      review_url: evaluation.review_url,
      shop_url: evaluation.shop_url,
      updated_at: evaluation.updated_at,
      user_id: evaluation.user_id,
    };

    const response = await application.request(
      `/evaluations?model_id=${evaluation.model_id}&user_id=${evaluation.user_id}`,
    );
    expect(await response.json()).toEqual(body);
    expect(response.ok).toBe(true);
  });
});
