import { database } from "../database.js";
import { getRandomEmail } from "../test_helper.js";
import { vi, describe, expect, test, beforeEach } from "vitest";

import * as sendMailModule from "../services/send_mail.js";
import application from "../application.js";

vi.mock("../services/send_mail.js");

describe("POST /authorization/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(sendMailModule.sendMail).mockResolvedValue(true);
  });

  test("returns 401 if email is not provided", async () => {
    const response = await application.request("/authorization/login", {
      method: "POST",
      body: null,
    });
    expect(response.status).toBe(401);
  });

  test("returns 401 if email is not valid", async () => {
    const response = await application.request("/authorization/login", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email" }),
    });
    expect(response.status).toBe(401);
  });

  test("returns 401 if email is valid but user does not exist", async () => {
    const response = await application.request("/authorization/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com" }),
    });
    expect(response.status).toBe(401);
  });

  test("returns 500 if sendMail throws an error", async () => {
    const user = await database.transaction().execute(async (transaction) => {
      return await transaction
        .insertInto("users")
        .values({
          display_name: "Test User",
          email: getRandomEmail(),
          scoring_system: "five_star",
          username: "test_user",
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    });

    vi.mocked(sendMailModule.sendMail).mockRejectedValue(new Error("Test error"));

    const response = await application.request("/authorization/login", {
      method: "POST",
      body: JSON.stringify({ email: user.email }),
    });
    expect(response.status).toBe(500);
  });

  test("creates JWT magic link token and sends email with magic link", async () => {
    const user = await database.transaction().execute(async (transaction) => {
      return await transaction
        .insertInto("users")
        .values({
          display_name: "Test User",
          email: getRandomEmail(),
          scoring_system: "five_star",
          username: "test_user",
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    });

    vi.mocked(sendMailModule.sendMail).mockResolvedValue(true);

    const response = await application.request("/authorization/login", {
      method: "POST",
      body: JSON.stringify({ email: user.email }),
    });

    const magicLinkToken = await database
      .selectFrom("jwt_magic_link_tokens")
      .selectAll()
      .where("user_id", "=", user.id)
      .executeTakeFirstOrThrow();

    expect(response.status).toBe(200);
    expect(magicLinkToken).toBeDefined();
    expect(sendMailModule.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: user.email,
        subject: "Your Magic Link",
        body: expect.stringContaining(magicLinkToken.token),
      }),
    );
  });
});
