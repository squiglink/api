import application from "../application.js";
import { createJwtToken } from "../services/create_jwt_token.js";
import { describe, expect, it } from "vitest";
import { signIn } from "../test_helper.js";

describe("POST /authorization/refresh", () => {
  it("responds with unauthorized if the refresh token is invalid", async () => {
    const response = await application.request("/authorization/refresh", {
      body: JSON.stringify({ refresh_token: await createJwtToken(0) }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("responds with success and returns tokens if the refresh token is valid", async () => {
    const { refreshToken } = await signIn();

    const response = await application.request("/authorization/refresh", {
      body: JSON.stringify({ refresh_token: refreshToken }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    expect(await response.json()).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });
    expect(response.status).toBe(200);
  });
});
