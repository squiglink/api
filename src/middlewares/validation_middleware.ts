import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Context, Next } from "hono";
import zod from "zod";

export const validationMiddleware = <TBody = any, TPath = any, TQuery = any>({
  bodySchema,
  pathSchema,
  querySchema,
  statusCode = 400,
}: {
  bodySchema?: zod.ZodSchema<TBody>;
  pathSchema?: zod.ZodSchema<TPath>;
  querySchema?: zod.ZodSchema<TQuery>;
  statusCode?: ContentfulStatusCode;
}) => {
  return async (
    context: Context<{
      Variables: {
        bodyParameters: TBody;
        pathParameters: TPath;
        queryParameters: TQuery;
      };
    }>,
    next: Next,
  ) => {
    if (bodySchema) {
      const text = await context.req.text();
      if (!text) return context.body(null, statusCode);

      const body = JSON.parse(text);
      const bodyZodSafeParseResult = bodySchema.safeParse(body);
      if (!bodyZodSafeParseResult.success) {
        return context.json(bodyZodSafeParseResult.error, statusCode);
      }
      context.set("bodyParameters", bodyZodSafeParseResult.data);
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
