import { authorizationMiddleware } from "./authorization_middleware.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { faker } from "@faker-js/faker";
import * as findUserModule from "../services/find_user_by_jwt_token.js";

vi.mock("../services/find_user_by_jwt_token.js");

describe(".authorizationMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets the current user context variable", async () => {
    const context: any = {
      req: { header: vi.fn().mockReturnValue("valid-token") },
      set: vi.fn(),
    };
    const currentUser = {
      created_at: faker.date.anytime(),
      display_name: faker.internet.displayName(),
      email: faker.internet.email(),
      id: faker.string.uuid(),
      scoring_system: faker.helpers.arrayElement([
        "five_star",
        "hundred_point",
        "ten_point",
        "ten_point_decimal",
      ]),
      updated_at: faker.date.anytime(),
      username: faker.internet.username(),
    };
    vi.mocked(findUserModule.findUserByJwtToken).mockResolvedValue(currentUser);

    await authorizationMiddleware(context, async () => {});

    expect(context.set).toHaveBeenCalledWith("currentUser", currentUser);
  });

  it("responds with unauthorized if the authorization token is not present", async () => {
    const body = vi.fn();
    const context: any = {
      body,
      req: { header: vi.fn().mockReturnValue(undefined) },
    };

    await authorizationMiddleware(context, async () => {
      throw new Error("Reached unreachable");
    });

    expect(body).toHaveBeenCalledWith(null, 401);
  });

  it("responds with unauthorized if the authorization token is invalid", async () => {
    const body = vi.fn();
    const context: any = {
      body,
      req: { header: vi.fn().mockReturnValue("invalid-token") },
    };
    vi.mocked(findUserModule.findUserByJwtToken).mockResolvedValue(null);

    await authorizationMiddleware(context, async () => {
      throw new Error("Reached unreachable");
    });

    expect(body).toHaveBeenCalledWith(null, 401);
  });
});
