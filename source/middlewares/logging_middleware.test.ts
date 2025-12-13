import { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loggingMiddleware } from "./logging_middleware.js";
import configuration from "../configuration.js";

describe("loggingMiddleware", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let originalApiEnvironment: string;

  beforeEach(() => {
    originalApiEnvironment = configuration.apiEnvironment;
    configuration.apiEnvironment = "development";
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    configuration.apiEnvironment = originalApiEnvironment;
    consoleLogSpy.mockRestore();
  });

  it("logs the request and the response", async () => {
    const application = new Hono();

    application.use(loggingMiddleware);
    application.post("/placeholder", (c) => c.text("placeholder"));

    await application.request("/placeholder", {
      method: "POST",
      body: JSON.stringify({ key: "value" }),
    });

    expect(consoleLogSpy.mock.calls[0][0]).toMatch(
      /\[.*\] \[.*\] POST http:\/\/localhost\/placeholder/,
    );
    expect(consoleLogSpy.mock.calls[1][0]).toMatch(/\[.*\] \[.*\] Request headers:/);
    expect(consoleLogSpy.mock.calls[1][1]).toMatch(/\{.*\}/);
    expect(consoleLogSpy.mock.calls[2][0]).toMatch(/\[.*\] \[.*\] Request body:/);
    expect(consoleLogSpy.mock.calls[2][1]).toBe('{"key":"value"}');
    expect(consoleLogSpy.mock.calls[3][0]).toMatch(
      /\[.*\] \[.*\] POST http:\/\/localhost\/placeholder 200/,
    );
    expect(consoleLogSpy.mock.calls[4][0]).toMatch(/\[.*\] \[.*\] Response headers:/);
    expect(consoleLogSpy.mock.calls[4][1]).toMatch(/\{.*\}/);
    expect(consoleLogSpy.mock.calls[5][0]).toMatch(/\[.*\] \[.*\] Response body:/);
    expect(consoleLogSpy.mock.calls[5][1]).toBe("placeholder");
  });
});
