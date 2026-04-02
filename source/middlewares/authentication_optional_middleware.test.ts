import { authenticationOptionalMiddleware } from "./authentication_optional_middleware.js";
import { describe, expect, it, mock } from "bun:test";

const getCurrentUser = mock();
mock.module("../services/get_current_user.js", () => ({ getCurrentUser }));

describe(".authenticationOptionalMiddleware", () => {
  it("sets the current user context variable", async () => {
    const next = mock();
    const context: any = {
      req: { header: mock().mockReturnValue("valid") },
      set: mock(),
    };
    const currentUser = { id: "placeholder" };
    getCurrentUser.mockResolvedValue(currentUser);

    await authenticationOptionalMiddleware(context, next);

    expect(context.set).toHaveBeenCalledWith("currentUser", currentUser);
  });
});
