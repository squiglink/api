import { count, signIn } from "../test_helper.js";
import { describe, expect, it } from "vitest";
import application from "../application.js";

describe("POST /brands/new", () => {
  it("responds with success and creates a new brand", async () => {
    const { authorizationToken } = await signIn();
    const body = { name: "Brand" };

    const response = await application.request("/brands/new", {
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${authorizationToken}` },
      method: "POST",
    });

    expect(await response.json()).toMatchObject(body);
    expect(await count("brands")).toEqual(1);
    expect(response.status).toBe(200);
  });
});
