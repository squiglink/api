import { createJwtToken } from "../services/create_jwt_token.js";
import { describe, expect, it } from "vitest";
import { signIn } from "../test_helper.js";
import application from "../application.js";

describe("POST /authorization/refresh", () => {
  it("responds with unauthorized if the authorization header is not provided", async () => {
    const response = await application.request("/authorization/refresh", {
      headers: {},
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if the request body is not provided", async () => {
    const response = await application.request("/authorization/refresh", {
      body: null,
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if the refresh token is not provided", async () => {
    const response = await application.request("/authorization/refresh", {
      body: JSON.stringify({}),
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if the refresh token is not valid", async () => {
    const response = await application.request("/authorization/refresh", {
      body: JSON.stringify({ refreshToken: await createJwtToken(0) }),
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if the refresh token is not associated with a user", async () => {
    const response = await application.request("/authorization/refresh", {
      body: JSON.stringify({ refreshToken: await createJwtToken(1000) }),
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("responds with success and returns tokens if the refresh token is valid", async () => {
    const { refreshToken } = await signIn();

    const response = await application.request("/authorization/refresh", {
      body: JSON.stringify({ refreshToken: refreshToken }),
      method: "POST",
    });

    expect(await response.json()).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
    expect(response.status).toBe(200);
  });
});
