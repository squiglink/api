import { database } from "../database.js";
import { verifyJwtToken } from "./verify_jwt_token.js";

export async function getUserFromJwtToken(token: string) {
  const payload = await verifyJwtToken(token);
  if (!payload) return null;

  return await database
    .selectFrom("users")
    .innerJoin("jwt_authorization_tokens", "users.id", "jwt_authorization_tokens.user_id")
    .where("jwt_authorization_tokens.token", "=", token)
    .selectAll("users")
    .executeTakeFirst();
}
