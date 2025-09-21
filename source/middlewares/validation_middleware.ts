import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Context, Next } from "hono";
import zod from "zod";

export const validationMiddleware = <TBody = any, THeader = any, TPath = any, TQuery = any>({
  bodySchema,
  headerSchema,
  pathSchema,
  querySchema,
  statusCode = 400,
}: {
  bodySchema?: zod.ZodSchema<TBody>;
  headerSchema?: zod.ZodSchema<THeader>;
  pathSchema?: zod.ZodSchema<TPath>;
  querySchema?: zod.ZodSchema<TQuery>;
  statusCode?: ContentfulStatusCode;
}) => {
  return async (
    context: Context<{
      Variables: {
        bodyParameters: TBody;
        headerParameters: THeader;
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

    if (headerSchema) {
      const header = context.req.header();
      const headerZodSafeParseResult = headerSchema.safeParse(header);
      if (!headerZodSafeParseResult.success) {
        return context.json(headerZodSafeParseResult.error, statusCode);
      }
      context.set("headerParameters", headerZodSafeParseResult.data);
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
