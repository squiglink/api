import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "bun:test";
import { insertBrand, insertUser } from "../test_helper.factories.js";
import { signIn } from "../test_helper.js";

describe("PATCH /brands/:id", () => {
  it("responds with forbidden if the user does not have the root role", async () => {
    const { brandId } = await database.transaction().execute(async (transaction) => {
      return { brandId: (await insertBrand(transaction)).id };
    });

    const { accessToken } = await signIn();
    const body = { name: "placeholder" };

    const response = await application.request(`/brands/${brandId}`, {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    });

    expect(response.status).toBe(403);
  });

  it("responds with success and updates a brand", async () => {
    const { brandId, userId } = await database.transaction().execute(async (transaction) => {
      const brandId = (await insertBrand(transaction)).id;
      const userId = (await insertUser(transaction, { role: "root" })).id;

      return { brandId, userId };
    });

    const { accessToken } = await signIn(userId);
    const body = { name: "placeholder" };

    const response = await application.request(`/brands/${brandId}`, {
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
});
