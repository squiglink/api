import { authenticationMiddleware } from "./authentication_middleware.js";
import { beforeEach, describe, expect, it, mock } from "bun:test";

const getCurrentUser = mock();
mock.module("../services/get_current_user.js", () => ({ getCurrentUser }));

describe(".authenticationMiddleware", () => {
  beforeEach(() => {
    getCurrentUser.mockClear();
  });

  it("responds with unauthorized if the authorization token is invalid", async () => {
    const body = mock();
    const context: any = {
      body,
      req: { header: mock().mockReturnValue("invalid") },
    };
    getCurrentUser.mockResolvedValue(null);

    await authenticationMiddleware(context, async () => {
      throw new Error("Reached unreachable.");
    });

    expect(body).toHaveBeenCalledWith(null, 401);
  });

  it("responds with unauthorized if the authorization token is not present", async () => {
    const body = mock();
    const context: any = {
      body,
      req: { header: mock().mockReturnValue(undefined) },
    };

    await authenticationMiddleware(context, async () => {
      throw new Error("Reached unreachable.");
    });

    expect(body).toHaveBeenCalledWith(null, 401);
  });

  it("sets the current user context variable", async () => {
    const context: any = {
      req: { header: mock().mockReturnValue("valid") },
      set: mock(),
    };
    const currentUser = {
      created_at: new Date(),
      display_name: "placeholder",
      email: "placeholder",
      id: "placeholder",
      scoring_system: "five_star" as const,
      updated_at: new Date(),
      username: "placeholder",
    };
    getCurrentUser.mockResolvedValue(currentUser);

    await authenticationMiddleware(context, async () => {});

    expect(context.set).toHaveBeenCalledWith("currentUser", currentUser);
  });
});
