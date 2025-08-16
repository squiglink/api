import type { Database } from "../types.js";
import type { Kysely } from "kysely";

export async function verifyDatabaseUser(
  currentUserId: string,
  database: Kysely<Database>,
  databaseId: string,
): Promise<boolean> {
  const databaseUserId = (
    await database
      .selectFrom("databases")
      .select("user_id")
      .where("id", "=", databaseId)
      .executeTakeFirst()
  )?.user_id;
  if (!databaseUserId) return false;
  if (currentUserId !== databaseUserId) return false;
  return true;
}
