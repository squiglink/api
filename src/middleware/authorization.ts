import type { Context } from "hono";
import { getUserFromJwtToken } from "../services/get_user_from_jwt_token.js";

export async function authorizationMiddleware(context: Context, next: () => Promise<void>) {
  const token = context.req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return context.body(null, 401);

  const user = await getUserFromJwtToken(token);
  if (!user) return context.body(null, 401);

  context.set("current_user", user);
  await next();
}
