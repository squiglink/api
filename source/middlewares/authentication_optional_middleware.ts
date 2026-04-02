import type { Context } from "hono";
import { getCurrentUser } from "../services/get_current_user.js";

export async function authenticationOptionalMiddleware(
  context: Context,
  next: () => Promise<void>,
) {
  const user = await getCurrentUser(context);
  if (user) context.set("currentUser", user);

  await next();
}
