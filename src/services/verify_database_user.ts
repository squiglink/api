import type { Database } from "../types.js";
import type { Kysely } from "kysely";

export async function verifyDatabaseUser(
  currentUserId: string,
  database: Kysely<Database>,
  databaseId: string,
): Promise<boolean> {
  const result = await database
    .selectFrom("databases")
    .select("user_id")
    .where("id", "=", databaseId)
    .executeTakeFirst();

  return result?.user_id === currentUserId;
}
