import { beforeEach, describe, expect, it, vi } from "vitest";
import { database } from "../database.js";
import { insertUser } from "../test_helper.factories.js";
import { sendEmail } from "../services/send_email.js";
import { validateCloudflareTurnstileToken } from "../services/validate_cloudflare_turnstile_token.js";
import application from "../application.js";
import configuration from "../configuration.js";

vi.mock("../configuration.js");
vi.mock("../services/send_email.js");
vi.mock("../services/validate_cloudflare_turnstile_token.js");

describe("POST /authorization/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendEmail).mockResolvedValue(true);
  });

  it("responds with unauthorized if the user does not exist", async () => {
    const response = await application.request("/authorization/login", {
      body: JSON.stringify({ email: "test@test.com" }),
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("responds with unauthorized if sending the email has failed", async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error("Whoops!"));

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
    vi.mocked(sendEmail).mockResolvedValue(true);

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
      vi.mocked(configuration).cloudflareTurnstileEnabled = true;
    });

    it("responds with success if the Cloudflare Turnstile token is valid", async () => {
      vi.mocked(sendEmail).mockResolvedValue(true);
      vi.mocked(validateCloudflareTurnstileToken).mockResolvedValue({
        "error-codes": [],
        action: "",
        cdata: "",
        challenge_ts: "",
        hostname: "",
        metadata: {},
        success: true,
      });

      const user = await database.transaction().execute(async (transaction) => {
        return await insertUser(transaction);
      });

      const response = await application.request("/authorization/login", {
        body: JSON.stringify({ email: user.email, cloudflareTurnstileToken: "placeholder" }),
        method: "POST",
        headers: { "CF-Connecting-IP": "127.0.0.1" },
      });

      expect(response.status).toBe(200);
      expect(validateCloudflareTurnstileToken).toHaveBeenCalledWith("placeholder", "127.0.0.1");
    });

    it("responds with unauthorized if the Cloudflare Turnstile token is invalid", async () => {
      vi.mocked(validateCloudflareTurnstileToken).mockResolvedValue({
        success: false,
        "error-codes": ["invalid-input-response"],
      });

      const user = await database.transaction().execute(async (transaction) => {
        return await insertUser(transaction);
      });

      const response = await application.request("/authorization/login", {
        body: JSON.stringify({ email: user.email, cloudflareTurnstileToken: "invalid-token" }),
        method: "POST",
        headers: { "CF-Connecting-IP": "127.0.0.1" },
      });

      expect(response.status).toBe(401);
      expect(validateCloudflareTurnstileToken).toHaveBeenCalledWith("invalid-token", "127.0.0.1");
    });
  });
});
