import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import { insertBrand, insertUser } from "../test_helper.factories.js";
import { signIn } from "../test_helper.js";
import application from "../application.js";

describe("PATCH /brands/:id", () => {
  it("responds with success and updates a brand", async () => {
    const { brandId, userId } = await database.transaction().execute(async (transaction) => {
      const userId = (await insertUser(transaction)).id;
      const brandId = (await insertBrand(transaction)).id;

      return { brandId, userId };
    });

    const { accessToken } = await signIn(userId);
    const body = {
      name: faker.company.name(),
    };

    const response = await application.request(`/brands/${brandId}`, {
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${accessToken}` },
      method: "PATCH",
    });

    expect(await response.json()).toMatchObject(body);
    expect(response.ok).toBe(true);
  });
});
