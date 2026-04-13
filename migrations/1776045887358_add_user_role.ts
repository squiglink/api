import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(database: Kysely<any>): Promise<void> {
  await database.schema.createType("user_role").asEnum(["creator", "root"]).execute();

  await database.schema
    .alterTable("users")
    .addColumn("role", sql`user_role`, (column) => column.notNull().defaultTo("creator"))
    .execute();
}
