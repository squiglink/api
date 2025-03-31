import { count, signIn } from "../test_helper.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertBrand, insertUser } from "../test_helper.factories.js";
import application from "../application.js";

describe("POST /models/new", () => {
  it("responds with success and creates a model", async () => {
    const { brandId, userId } = await database.transaction().execute(async (transaction) => {
      return {
        brandId: (await insertBrand(transaction)).id,
        userId: (await insertUser(transaction)).id,
      };
    });

    const body = {
      brand_id: brandId,
      name: "Model",
    };

    const { authorizationToken } = await signIn(userId);

    const response = await application.request("/models/new", {
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${authorizationToken}` },
      method: "POST",
    });

    expect(await response.json()).toMatchObject(body);
    expect(await count("models")).toEqual(1);
    expect(response.ok).toBe(true);
  });
});
