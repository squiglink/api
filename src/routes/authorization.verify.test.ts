import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { getRandomEmail } from "../test_helper.js";
import application from "../application.js";
import configuration from "../configuration.js";

describe("GET /authorization/verify", () => {
  it("responds with unauthorized if the magic link token is not provided", async () => {
    const response = await application.request("/authorization/verify");

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if the magic link token is not valid", async () => {
    const response = await application.request("/authorization/verify?token=invalid-token");

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if the magic link token is not associated with a user", async () => {
    const invalidToken = await createJwtToken(configuration.jwtExpirationTimeMagicLinkToken * 1000);
    const response = await application.request(`/authorization/verify?token=${invalidToken}`);

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if the magic link token is expired", async () => {
    const expiredToken = await createJwtToken(0);
    const response = await application.request(`/authorization/verify?token=${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it("responds with success and tokens if the magic link token is valid", async () => {
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

    const response = await application.request(`/authorization/verify?token=${magicLinkToken}`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });
});
