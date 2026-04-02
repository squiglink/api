import type { Context } from "hono";
import { getCurrentUser } from "../services/get_current_user.js";

export async function authenticationMiddleware(context: Context, next: () => Promise<void>) {
  const user = await getCurrentUser(context);
  if (!user) return context.body(null, 401);

  context.set("currentUser", user);
  await next();
}
