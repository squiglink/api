import { count, signIn } from "../test_helper.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertEvaluation, insertModel, insertUser } from "../test_helper.factories.js";
import application from "../application.js";

describe("POST /evaluations/new", () => {
  it("responds with success and creates an evaluation", async () => {
    const { modelId, userId } = await database.transaction().execute(async (transaction) => {
      const modelId = (await insertModel(transaction)).id;
      const userId = (await insertUser(transaction)).id;

      return { modelId, userId };
    });

    const { authorizationToken } = await signIn(userId);
    const body = {
      model_id: modelId,
      review_score: 123,
      review_url: "123",
      shop_url: "123",
    };

    const response = await application.request("/evaluations/new", {
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${authorizationToken}` },
      method: "POST",
    });

    expect(await response.json()).toMatchObject(body);
    expect(await count("models")).toEqual(1);
    expect(response.status).toBe(200);
  });

  it("responds with bad request is trying to create an evaluation when it already exists", async () => {
    const { userId, modelId } = await database.transaction().execute(async (transaction) => {
      const userId = (await insertUser(transaction)).id;
      const modelId = (await insertModel(transaction)).id;
      await insertEvaluation(transaction, { model_id: modelId, user_id: userId });

      return { userId, modelId };
    });

    const { authorizationToken } = await signIn(userId);
    const requestBody = {
      model_id: modelId,
      review_score: 123,
      review_url: "123",
      shop_url: "123",
    };
    const responseBody = { error: "An evaluation for the model already exists." };

    const response = await application.request(`/evaluations/new`, {
      body: JSON.stringify(requestBody),
      headers: { Authorization: `Bearer ${authorizationToken}` },
      method: "POST",
    });

    expect(await response.json()).toEqual(responseBody);
    expect(response.status).toBe(400);
  });
});
