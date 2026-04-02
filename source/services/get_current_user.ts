import type { Context } from "hono";
import { database } from "../database.js";
import { verifyJwtToken } from "./verify_jwt_token.js";

export async function getCurrentUser(context: Context) {
  const token = context.req.header("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const payload = await verifyJwtToken(token);
  if (!payload) return null;

  return (
    (await database
      .selectFrom("users")
      .innerJoin("jwt_access_tokens", "users.id", "jwt_access_tokens.user_id")
      .where("jwt_access_tokens.token", "=", token)
      .selectAll("users")
      .executeTakeFirst()) ?? null
  );
}
