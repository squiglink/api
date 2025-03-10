import { sql, type Kysely } from "kysely";

export async function up(database: Kysely<any>): Promise<void> {
  await database.schema
    .createTable("brands")
    .addColumn("id", "bigserial", (column) => column.primaryKey())
    .addColumn("created_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn("name", "text", (column) => column.notNull().unique())
    .addColumn("updated_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .execute();

  await database.schema
    .createTable("users")
    .addColumn("id", "bigserial", (column) => column.primaryKey())
    .addColumn("created_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn("display_name", "text", (column) => column.notNull())
    .addColumn("email", "text", (column) => column.notNull().unique())
    .addColumn("scoring_system", sql`user_scoring_system`, (column) => column.notNull())
    .addColumn("updated_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn("username", "text", (column) => column.notNull().unique())
    .execute();

  await database.schema
    .createTable("databases")
    .addColumn("id", "bigserial", (column) => column.primaryKey())
    .addColumn("created_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn("kind", sql`database_kind`, (column) => column.notNull())
    .addColumn("path", "text", (column) => column.notNull())
    .addColumn("updated_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn("user_id", "bigint", (column) =>
      column.references("users.id").notNull().onDelete("cascade"),
    )
    .addUniqueConstraint("databases_path_and_user_id_unique", ["path", "user_id"])
    .execute();

  await database.schema
    .createTable("models")
    .addColumn("id", "bigserial", (column) => column.primaryKey())
    .addColumn("brand_id", "bigint", (column) =>
      column.references("brands.id").notNull().onDelete("cascade"),
    )
    .addColumn("created_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn("name", "text", (column) => column.notNull())
    .addColumn("updated_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("models_brand_id_and_name_unique", ["brand_id", "name"])
    .execute();

  await database.schema
    .createTable("evaluations")
    .addColumn("id", "bigserial", (column) => column.primaryKey())
    .addColumn("created_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn("database_id", "bigint", (column) =>
      column.references("databases.id").notNull().onDelete("cascade"),
    )
    .addColumn("model_id", "bigint", (column) =>
      column.references("models.id").notNull().onDelete("cascade"),
    )
    .addColumn("review_score", "real")
    .addColumn("review_url", "text")
    .addColumn("shop_url", "text")
    .addColumn("updated_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .execute();

  await database.schema
    .createTable("measurements")
    .addColumn("id", "bigserial", (column) => column.primaryKey())
    .addColumn("created_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn("evaluation_id", "bigint", (column) =>
      column.references("evaluations.id").notNull().onDelete("cascade"),
    )
    .addColumn("kind", sql`measurement_kind`, (column) => column.notNull())
    .addColumn("label", "text", (column) => column.notNull())
    .addColumn("left_channel", "text", (column) => column.notNull())
    .addColumn("right_channel", "text", (column) => column.notNull())
    .addColumn("updated_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .execute();

  await database.schema
    .createTable("jwt_authorization_tokens")
    .addColumn("id", "bigserial", (column) => column.primaryKey())
    .addColumn("created_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn("user_id", "bigint", (column) =>
      column.references("users.id").notNull().onDelete("cascade"),
    )
    .addColumn("token", "text", (column) => column.notNull())
    .execute();

  await database.schema
    .createTable("jwt_magic_link_tokens")
    .addColumn("id", "bigserial", (column) => column.primaryKey())
    .addColumn("created_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn("token", "text", (column) => column.notNull())
    .addColumn("user_id", "bigint", (column) =>
      column.references("users.id").notNull().unique().onDelete("cascade"),
    )
    .execute();

  await database.schema
    .createTable("jwt_refresh_tokens")
    .addColumn("id", "bigserial", (column) => column.primaryKey())
    .addColumn("created_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamp", (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn("user_id", "bigint", (column) =>
      column.references("users.id").notNull().onDelete("cascade"),
    )
    .addColumn("token", "text", (column) => column.notNull())
    .execute();
}
