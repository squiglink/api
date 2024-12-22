import { sql, type Kysely } from "kysely";

export async function up(database: Kysely<any>): Promise<void> {
  await database.schema
    .createTable("users")
    .addColumn("id", "bigserial", (column) => column.primaryKey())
    .addColumn("display_name", "text", (column) => column.notNull())
    .addColumn("scoring_system", sql`user_scoring_system`, (column) =>
      column.notNull(),
    )
    .addColumn("username", "text", (column) => column.notNull().unique())
    .execute();

  await database.schema
    .createTable("databases")
    .addColumn("id", "bigserial", (column) => column.primaryKey())
    .addColumn("kind", sql`database_kind`, (column) => column.notNull())
    .addColumn("path", "text", (column) => column.notNull())
    .addColumn("user_id", "bigint", (column) =>
      column.references("users.id").notNull().onDelete("cascade"),
    )
    .addUniqueConstraint("databases_path_and_user_id_unique", [
      "path",
      "user_id",
    ])
    .execute();
}
