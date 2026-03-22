import application from "../application.js";
import configuration from "../configuration.js";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { database } from "../database.js";
import { insertUser } from "../test_helper.factories.js";

const sendEmail = mock();
mock.module("../services/send_email.js", () => ({ sendEmail }));

const validateCloudflareTurnstileToken = mock();
mock.module("../services/validate_cloudflare_turnstile_token.js", () => ({
  validateCloudflareTurnstileToken,
}));

describe("POST /authentication/login", () => {
  beforeEach(() => {
    configuration.cloudflareTurnstileEnabled = false;
    sendEmail.mockClear();
    validateCloudflareTurnstileToken.mockClear();
    sendEmail.mockResolvedValue({ success: true, id: "placeholder" });
  });

  it("responds with unauthorized if the user does not exist", async () => {
    const response = await application.request("/authentication/login", {
      body: JSON.stringify({ email: "test@test.com" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if sending the email has failed", async () => {
    sendEmail.mockResolvedValue({
      message: "placeholder",
      name: "placeholder",
      statusCode: 500,
      success: false,
    });

    const user = await database.transaction().execute(async (transaction) => {
      return await insertUser(transaction);
    });

    const response = await application.request("/authentication/login", {
      body: JSON.stringify({ email: user.email }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("creates a JWT magic link token and sends an email with the magic link", async () => {
    const user = await database.transaction().execute(async (transaction) => {
      return await insertUser(transaction);
    });

    const response = await application.request("/authentication/login", {
      body: JSON.stringify({ email: user.email }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const magicLinkToken = await database
      .selectFrom("jwt_magic_link_tokens")
      .selectAll()
      .where("user_id", "=", user.id)
      .executeTakeFirstOrThrow();

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: user.email,
        subject: "Log into Squiglink",
        body: expect.stringContaining(magicLinkToken.token),
      }),
    );
    expect(response.status).toBe(200);
  });

  describe("when Cloudflare Turnstile is enabled", () => {
    beforeEach(() => {
      configuration.cloudflareTurnstileEnabled = true;
    });

    it("responds with success if the Cloudflare Turnstile token is valid", async () => {
      validateCloudflareTurnstileToken.mockResolvedValue({
        "error-codes": [],
        action: "placeholder",
        cdata: "placeholder",
        challenge_ts: "placeholder",
        hostname: "placeholder",
        metadata: {},
        success: true,
      });

      const user = await database.transaction().execute(async (transaction) => {
        return await insertUser(transaction);
      });

      const response = await application.request("/authentication/login", {
        body: JSON.stringify({ email: user.email, cloudflareTurnstileToken: "valid" }),
        method: "POST",
        headers: {
          "cf-connecting-ip": "127.0.0.1",
          "content-type": "application/json",
        },
      });

      expect(response.status).toBe(200);
      expect(validateCloudflareTurnstileToken).toHaveBeenCalledWith("127.0.0.1", "valid");
    });

    it("responds with unauthorized if the Cloudflare Turnstile token is invalid", async () => {
      validateCloudflareTurnstileToken.mockResolvedValue({
        success: false,
        "error-codes": ["invalid-input-response"],
      });

      const user = await database.transaction().execute(async (transaction) => {
        return await insertUser(transaction);
      });

      const response = await application.request("/authentication/login", {
        body: JSON.stringify({ email: user.email, cloudflareTurnstileToken: "invalid" }),
        method: "POST",
        headers: {
          "cf-connecting-ip": "127.0.0.1",
          "content-type": "application/json",
        },
      });

      expect(response.status).toBe(401);
      expect(validateCloudflareTurnstileToken).toHaveBeenCalledWith("127.0.0.1", "invalid");
    });
  });
});
