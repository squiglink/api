import { createMiddleware } from "hono/factory";
import { randomUUID } from "node:crypto";
import configuration from "../configuration.js";

export const loggingMiddleware = createMiddleware(async (context, next) => {
  if (context.req.method === "OPTIONS") {
    await next();
    return;
  }

  if (configuration.apiEnvironment === "test") {
    await next();
    return;
  }

  const timestamp = new Date().toISOString();
  const uuid = randomUUID();

  const log = (message: string, ...args: unknown[]) => {
    console.log(`[${uuid}] [${timestamp}] ${message}`, ...args);
  };

  log(`${context.req.method} ${context.req.url}`);
  log("Request headers:", JSON.stringify(context.req.header()));

  const requestBody = await context.req.text();
  if (requestBody) {
    try {
      log("Request body:", JSON.stringify(JSON.parse(requestBody)));
    } catch {
      log("Request body:", requestBody);
    }
  }

  await next();

  log(`${context.req.method} ${context.req.url} ${context.res.status}`);
  log("Response headers:", JSON.stringify(Object.fromEntries(context.res.headers.entries())));

  const responseBody = await context.res.clone().text();
  if (responseBody) {
    try {
      log("Response body:", JSON.stringify(JSON.parse(responseBody)));
    } catch {
      log("Response body:", responseBody);
    }
  }
});
