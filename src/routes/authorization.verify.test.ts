import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertJwtMagicLinkToken } from "../test_helper.factories.js";
import application from "../application.js";

describe("GET /authorization/verify", () => {
  it("responds with unauthorized if the magic link token is invalid", async () => {
    const response = await application.request("/authorization/verify?token=invalid-token");

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if the magic link token is expired", async () => {
    const expiredToken = await createJwtToken(0);

    const response = await application.request(`/authorization/verify?token=${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it("responds with success and returns tokens if the magic link token is valid", async () => {
    const magicLinkToken = (
      await database.transaction().execute(async (transaction) => {
        return await insertJwtMagicLinkToken(transaction);
      })
    ).token;

    const response = await application.request(`/authorization/verify?token=${magicLinkToken}`);

    expect(await response.json()).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });
    expect(response.status).toBe(200);
  });
});
