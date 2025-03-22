import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { describe, expect, test } from "vitest";
import { getRandomEmail } from "../test_helper.js";

import application from "../application.js";
import configuration from "../configuration.js";

describe("GET /authorization/verify", () => {
  test("returns 401 if token is not provided", async () => {
    const response = await application.request("/authorization/verify", {
      method: "GET",
    });

    expect(response.status).toBe(401);
  });

  test("returns 401 if token is not valid", async () => {
    const response = await application.request("/authorization/verify?token=invalid-token", {
      method: "GET",
    });

    expect(response.status).toBe(401);
  });

  test("returns 401 if user associated with token is not found", async () => {
    const invalidToken = await createJwtToken(configuration.jwtExpirationTimeMagicLinkToken * 1000);
    const response = await application.request(`/authorization/verify?token=${invalidToken}`, {
      method: "GET",
    });

    expect(response.status).toBe(401);
  });

  test("returns 401 if token is expired", async () => {
    const expiredToken = await createJwtToken(0);
    const response = await application.request(`/authorization/verify?token=${expiredToken}`, {
      method: "GET",
    });

    expect(response.status).toBe(401);
  });

  test("returns 200 with accessToken and refreshToken if token is valid", async () => {
    const magicLinkToken = (
      await database.transaction().execute(async (transaction) => {
        const user = await transaction
          .insertInto("users")
          .values({
            email: getRandomEmail(),
            display_name: "Test User",
            scoring_system: "five_star",
            username: "test_user",
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        const authToken = await createJwtToken(
          configuration.jwtExpirationTimeMagicLinkToken * 1000,
        );

        return await transaction
          .insertInto("jwt_magic_link_tokens")
          .values({ token: authToken, user_id: user.id })
          .returning("token")
          .executeTakeFirstOrThrow();
      })
    ).token;

    const response = await application.request(`/authorization/verify?token=${magicLinkToken}`, {
      method: "GET",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });
});
