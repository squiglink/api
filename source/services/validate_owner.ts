import type { Database } from "../types.js";
import type { Kysely } from "kysely";

export async function validateOwner(
  currentUserId: string,
  database: Kysely<Database>,
  id: string,
  tableName: keyof Database,
): Promise<boolean> {
  const result = await database
    .selectFrom(tableName)
    .select("user_id")
    .where("id", "=", id)
    .executeTakeFirst();

  return result?.user_id === currentUserId;
}
