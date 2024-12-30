import { sql, type Kysely } from "kysely";

export async function up(database: Kysely<any>): Promise<void> {
  sql`create extension if not exists btree_gin`.execute(database);
  sql`create extension if not exists pg_trgm`.execute(database);
}
