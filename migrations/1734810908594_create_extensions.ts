import { sql, type Kysely } from "kysely";

export async function up(database: Kysely<any>): Promise<void> {
  await sql`create extension if not exists btree_gin`.execute(database);
  await sql`create extension if not exists pg_trgm`.execute(database);
}
