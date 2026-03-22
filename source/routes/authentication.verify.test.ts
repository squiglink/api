import application from "../application.js";
import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { describe, expect, it } from "bun:test";
import { insertJwtMagicLinkToken } from "../test_helper.factories.js";

describe("GET /authentication/verify", () => {
  it("responds with unauthorized if the magic link token is invalid", async () => {
    const response = await application.request("/authentication/verify?token=invalid-token");

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if the magic link token is expired", async () => {
    const expiredToken = await createJwtToken(0);

    const response = await application.request(`/authentication/verify?token=${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it("responds with success and returns tokens if the magic link token is valid", async () => {
    const magicLinkToken = (
      await database.transaction().execute(async (transaction) => {
        return await insertJwtMagicLinkToken(transaction);
      })
    ).token;

    const response = await application.request(`/authentication/verify?token=${magicLinkToken}`);

    expect(await response.json()).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
      user_id: expect.any(String),
    });
    expect(response.status).toBe(200);
  });
});
