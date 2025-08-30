import { beforeEach, describe, expect, it, vi } from "vitest";
import { database } from "../database.js";
import { insertUser } from "../test_helper.factories.js";
import * as sendEmailModule from "../services/send_email.js";
import application from "../application.js";

vi.mock("../services/send_email.js");

describe("POST /authorization/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendEmailModule.sendEmail).mockResolvedValue(true);
  });

  it("responds with unauthrorized if the user does not exist", async () => {
    const response = await application.request("/authorization/login", {
      body: JSON.stringify({ email: "test@test.com" }),
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if sending the email has failed", async () => {
    vi.mocked(sendEmailModule.sendEmail).mockRejectedValue(new Error("Test error"));

    const user = await database.transaction().execute(async (transaction) => {
      return await insertUser(transaction);
    });

    const response = await application.request("/authorization/login", {
      body: JSON.stringify({ email: user.email }),
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("creates a JWT magic link token and sends an email with the magic link", async () => {
    vi.mocked(sendEmailModule.sendEmail).mockResolvedValue(true);

    const user = await database.transaction().execute(async (transaction) => {
      return await insertUser(transaction);
    });

    const response = await application.request("/authorization/login", {
      body: JSON.stringify({ email: user.email }),
      method: "POST",
    });

    const magicLinkToken = await database
      .selectFrom("jwt_magic_link_tokens")
      .selectAll()
      .where("user_id", "=", user.id)
      .executeTakeFirstOrThrow();

    expect(sendEmailModule.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: user.email,
        subject: "Log into Squiglink",
        body: expect.stringContaining(magicLinkToken.token),
      }),
    );
    expect(response.status).toBe(200);
  });
});
