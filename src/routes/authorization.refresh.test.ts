import { createJwtToken } from "../services/create_jwt_token.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { getRandomEmail } from "../test_helper.js";
import { signIn } from "../test_helper.js";
import application from "../application.js";

describe("POST /authorization/refresh", () => {
  it("responds with unauthorized if the authorization header is not provided", async () => {
    const response = await application.request("/authorization/refresh", {
      method: "POST",
      headers: {},
    });

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if the request body is not provided", async () => {
    const user = await database.transaction().execute(async (transaction) => {
      return await transaction
        .insertInto("users")
        .values({
          email: getRandomEmail(),
          display_name: "Test User",
          scoring_system: "five_star",
          username: "test_user",
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    });

    const { accessToken } = await signIn(user.id);

    const response = await application.request("/authorization/refresh", {
      method: "POST",
      body: null,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if the refresh token is not provided", async () => {
    const user = await database.transaction().execute(async (transaction) => {
      return await transaction
        .insertInto("users")
        .values({
          email: getRandomEmail(),
          display_name: "Test User",
          scoring_system: "five_star",
          username: "test_user",
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    });

    const { accessToken } = await signIn(user.id);

    const response = await application.request("/authorization/refresh", {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if the refresh token is not valid", async () => {
    const user = await database.transaction().execute(async (transaction) => {
      return await transaction
        .insertInto("users")
        .values({
          email: getRandomEmail(),
          display_name: "Test User",
          scoring_system: "five_star",
          username: "test_user",
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    });

    const { accessToken } = await signIn(user.id);

    const invalidRefreshToken = await createJwtToken(0);

    const response = await application.request("/authorization/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: invalidRefreshToken }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if the refresh token is not associated with a user", async () => {
    const user = await database.transaction().execute(async (transaction) => {
      return await transaction
        .insertInto("users")
        .values({
          email: getRandomEmail(),
          display_name: "Test User",
          scoring_system: "five_star",
          username: "test_user",
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    });

    const { accessToken } = await signIn(user.id);

    const invalidRefreshToken = await createJwtToken(1000);

    const response = await application.request("/authorization/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: invalidRefreshToken }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.status).toBe(401);
  });

  it("responds with success and returns tokens if the refresh token is valid", async () => {
    const user = await database.transaction().execute(async (transaction) => {
      return await transaction
        .insertInto("users")
        .values({
          email: getRandomEmail(),
          display_name: "Test User",
          scoring_system: "five_star",
          username: "test_user",
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    });

    const { accessToken, refreshToken } = await signIn(user.id);

    const response = await application.request("/authorization/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });
});
