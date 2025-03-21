import application from "../application.js";
import { count } from "../test_helper.js";
import { describe, expect, test } from "vitest";

describe("POST /brands/new", () => {
  test("creates a new brand", async () => {
    let body = { name: "Brand" };

    const response = await application.request("/brands/new", {
      body: JSON.stringify(body),
      method: "POST",
    });

    expect(await response.json()).toMatchObject(body);
    expect(response.ok).toBe(true);
    expect(await count("brands")).toEqual(1);
  });
});
