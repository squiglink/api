import application from "../application.js";
import { signIn } from "../test_helper.js";
import { describe, expect, it } from "bun:test";

describe("POST /databases", () => {
  it("responds with success and creates a database", async () => {
    const { accessToken } = await signIn();
    const body = { kind: "headphones", path: "placeholder" };

    const response = await application.request("/databases", {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
    });

    expect(await response.json()).toMatchObject(body);
    expect(response.ok).toBe(true);
  });
});
