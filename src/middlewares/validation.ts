import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Context, Next } from "hono";
import zod from "zod";

export const validationMiddleware = <TJson = any, TPath = any, TQuery = any>({
  bodySchema,
  pathSchema,
  querySchema,
  statusCode = 400,
}: {
  bodySchema?: zod.ZodSchema<TJson>;
  pathSchema?: zod.ZodSchema<TPath>;
  querySchema?: zod.ZodSchema<TQuery>;
  statusCode?: ContentfulStatusCode;
}) => {
  return async (
    context: Context<{
      Variables: {
        jsonParameters: TJson;
        pathParameters: TPath;
        queryParameters: TQuery;
      };
    }>,
    next: Next,
  ) => {
    if (bodySchema) {
      const text = await context.req.text();
      if (!text) return context.body(null, statusCode);

      const json = JSON.parse(text);
      const JsonZodSafeParseResult = bodySchema.safeParse(json);
      if (!JsonZodSafeParseResult.success) {
        return context.json(JsonZodSafeParseResult.error, statusCode);
      }
      context.set("jsonParameters", JsonZodSafeParseResult.data);
    }

    if (pathSchema) {
      const path = context.req.param();
      const pathZodSafeParseResult = pathSchema.safeParse(path);
      if (!pathZodSafeParseResult.success) {
        return context.json(pathZodSafeParseResult.error, statusCode);
      }
      context.set("pathParameters", pathZodSafeParseResult.data);
    }

    if (querySchema) {
      const query = context.req.query();
      const queryZodSafeParseResult = querySchema.safeParse(query);
      if (!queryZodSafeParseResult.success) {
        return context.json(queryZodSafeParseResult.error, statusCode);
      }
      context.set("queryParameters", queryZodSafeParseResult.data);
    }

    await next();
  };
};
