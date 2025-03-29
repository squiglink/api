import { beforeEach, describe, expect, it, vi } from "vitest";
import { database } from "../database.js";
import { getRandomEmail } from "../test_helper.js";
import * as sendMailModule from "../services/send_mail.js";
import application from "../application.js";

vi.mock("../services/send_mail.js");

describe("POST /authorization/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendMailModule.sendMail).mockResolvedValue(true);
  });

  it("responds with unauthrorized if the email is not provided", async () => {
    const response = await application.request("/authorization/login", {
      body: JSON.stringify({}),
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("responds with unauthrorized if the email is not valid", async () => {
    const response = await application.request("/authorization/login", {
      body: JSON.stringify({ email: "invalid-email" }),
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("responds with unauthrorized if the email is valid but the user does not exist", async () => {
    const response = await application.request("/authorization/login", {
      body: JSON.stringify({ email: "test@test.com" }),
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("responds with internal server error if sendMail throws an error", async () => {
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
      body: JSON.stringify({ email: user.email }),
      method: "POST",
    });

    expect(response.status).toBe(500);
  });

  it("creates a JWT magic link token and sends an email with the magic link", async () => {
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
      body: JSON.stringify({ email: user.email }),
      method: "POST",
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
        subject: "Log into Squiglink",
        body: expect.stringContaining(magicLinkToken.token),
      }),
    );
  });
});
