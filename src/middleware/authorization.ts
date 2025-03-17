import { findUserByJwtToken } from "../services/find_user_by_jwt_token.js";
import type { Context } from "hono";

export async function authorizationMiddleware(context: Context, next: () => Promise<void>) {
  const token = context.req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return context.body(null, 401);

  const user = await findUserByJwtToken(token);
  if (!user) return context.body(null, 401);

  context.set("currentUser", user);
  await next();
}
