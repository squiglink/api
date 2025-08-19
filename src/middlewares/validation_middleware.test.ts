import { describe, expect, it, vi } from "vitest";
import { validationMiddleware } from "./validation_middleware.js";
import zod, { ZodError } from "zod";

describe(".validationMiddleware", () => {
  it("sets the body parameters context variable", async () => {
    const bodySchema = zod.object({ foo: zod.string() });
    const bodyParameters = { foo: "bar" };
    const context: any = {
      req: { text: vi.fn().mockReturnValue(JSON.stringify(bodyParameters)) },
      set: vi.fn(),
    };

    await validationMiddleware({ bodySchema })(context, async () => {});

    expect(context.set).toHaveBeenCalledWith("bodyParameters", bodyParameters);
  });

  it("sets the path parameters context variable", async () => {
    const pathParameters = { foo: "bar" };
    const pathSchema = zod.object({ foo: zod.string() });
    const context: any = {
      req: { param: vi.fn().mockReturnValue(pathParameters) },
      set: vi.fn(),
    };

    await validationMiddleware({ pathSchema })(context, async () => {});

    expect(context.set).toHaveBeenCalledWith("pathParameters", pathParameters);
  });

  it("sets the query parameters context variable", async () => {
    const queryParameters = { foo: "bar" };
    const querySchema = zod.object({ foo: zod.string() });
    const context: any = {
      req: { query: vi.fn().mockReturnValue(queryParameters) },
      set: vi.fn(),
    };

    await validationMiddleware({ querySchema })(context, async () => {});

    expect(context.set).toHaveBeenCalledWith("queryParameters", queryParameters);
  });

  it("responds with bad request if the body is required, but not present", async () => {
    const body = vi.fn();
    const context: any = {
      body,
      req: { text: vi.fn().mockResolvedValue(null) },
    };

    await validationMiddleware({ bodySchema: zod.object({ foo: zod.string() }) })(
      context,
      async () => {
        throw new Error("Reached unreachable");
      },
    );

    expect(body).toHaveBeenCalledWith(null, 400);
  });

  it("responds with bad request if the body parameters do not match the schema", async () => {
    const json = vi.fn();
    const context: any = {
      json,
      req: { text: vi.fn().mockResolvedValue(JSON.stringify({ uuid: "invalid-uuid" })) },
    };

    await validationMiddleware({ bodySchema: zod.object({ uuid: zod.uuid() }) })(
      context,
      async () => {
        throw new Error("Reached unreachable");
      },
    );

    expect(json).toHaveBeenCalledWith(expect.any(ZodError), 400);
  });

  it("responds with bad request if the path parameters do not match the schema", async () => {
    const json = vi.fn();
    const context: any = {
      json,
      req: { param: vi.fn().mockReturnValue({ id: "invalid-uuid" }) },
    };

    await validationMiddleware({ pathSchema: zod.object({ id: zod.uuid() }) })(
      context,
      async () => {
        throw new Error("Reached unreachable");
      },
    );

    expect(json).toHaveBeenCalledWith(expect.any(ZodError), 400);
  });

  it("responds with bad request if the query parameters do not match the schema", async () => {
    const json = vi.fn();
    const context: any = {
      json,
      req: { query: vi.fn().mockReturnValue({ uuid: "invalid-uuid" }) },
    };

    await validationMiddleware({ querySchema: zod.object({ uuid: zod.uuid() }) })(
      context,
      async () => {
        throw new Error("Reached unreachable");
      },
    );

    expect(json).toHaveBeenCalledWith(expect.any(ZodError), 400);
  });
});
