import application from "../application.js";
import { database } from "../database.js";
import { vi, describe, expect, test, beforeEach } from "vitest";
import { Resend } from "resend";

vi.mock("resend");

describe("POST /authorization/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockResend = {
      emails: {
        send: vi.fn().mockResolvedValue({
          id: "default",
          status: "default",
          error: null,
        }),
      },
    };

    vi.mocked(Resend).mockImplementation(() => mockResend as unknown as Resend);
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

  test("returns 500 if Resend returns an error", async () => {
    const user = await database.transaction().execute(async (transaction) => {
      return await transaction
        .insertInto("users")
        .values({
          display_name: "Test User",
          email: "test@test.com",
          scoring_system: "five_star",
          username: "test_user",
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    });

    const mockWithError = {
      emails: {
        send: vi.fn().mockResolvedValue({
          error: {
            message: "Test error",
          },
        }),
      },
    };

    vi.mocked(Resend).mockImplementation(() => mockWithError as unknown as Resend);

    const response = await application.request("/authorization/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com" }),
    });
    expect(response.status).toBe(500);
  });

  test("creates JWT magic link token and sends email with magic link", async () => {
    const user = await database.transaction().execute(async (transaction) => {
      return await transaction
        .insertInto("users")
        .values({
          display_name: "Test User",
          email: "test@test.com",
          scoring_system: "five_star",
          username: "test_user",
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    });

    const mockSuccess = {
      emails: {
        send: vi.fn().mockResolvedValue({
          id: "1",
          status: "sent",
          error: null,
        }),
      },
    };

    vi.mocked(Resend).mockImplementation(() => mockSuccess as unknown as Resend);

    const response = await application.request("/authorization/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com" }),
    });

    const magicLinkToken = await database
      .selectFrom("jwt_magic_link_tokens")
      .selectAll()
      .where("user_id", "=", user.id)
      .executeTakeFirstOrThrow();

    expect(response.status).toBe(200);
    expect(magicLinkToken).toBeDefined();
  });
});
