import application from "../application.js";
import { count, signIn } from "../test_helper.js";
import { describe, expect, it } from "vitest";

describe("POST /brands", () => {
  it("responds with success and creates a brand", async () => {
    const { accessToken } = await signIn();
    const body = { name: "Brand" };

    const response = await application.request("/brands", {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
    });

    expect(await response.json()).toMatchObject(body);
    expect(await count("brands")).toEqual(1);
    expect(response.status).toBe(200);
  });
});
