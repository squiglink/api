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

  const log = (message: string) => {
    console.log(`[${uuid}] [${timestamp}] ${message}`);
  };

  log(`Request body: \`${(await context.req.text()) || null}\`.`);
  log(`Request headers: \`${JSON.stringify(context.req.header())}\`.`);
  log(`Request method: \`${context.req.method}\`.`);
  log(`Request URL: \`${context.req.url}\`.`);

  await next();

  log(`Response body: \`${(await context.res.clone().text()) || null}\`.`);
  log(
    `Response headers: \`${JSON.stringify(Object.fromEntries(context.res.headers.entries()))}\`.`,
  );
  log(`Response status: \`${context.res.status}\`.`);
});
