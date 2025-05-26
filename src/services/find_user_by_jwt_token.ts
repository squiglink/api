import { database } from "../database.js";
import { verifyJwtToken } from "./verify_jwt_token.js";

export async function findUserByJwtToken(token: string) {
  const payload = await verifyJwtToken(token);
  if (!payload) return null;

  return await database
    .selectFrom("users")
    .innerJoin("jwt_access_tokens", "users.id", "jwt_access_tokens.user_id")
    .where("jwt_access_tokens.token", "=", token)
    .selectAll("users")
    .executeTakeFirst();
}
