import { sql, type Kysely } from "kysely";

export async function up(database: Kysely<any>): Promise<void> {
  await database.schema
    .createTable("brands")
    .addColumn("id", "uuid", (column) => column.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("created_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addColumn("name", "text", (column) => column.notNull().unique())
    .addColumn("updated_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .execute();

  await database.schema
    .createTable("users")
    .addColumn("id", "uuid", (column) => column.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("created_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addColumn("display_name", "text", (column) => column.notNull())
    .addColumn("email", "text", (column) => column.notNull().unique())
    .addColumn("scoring_system", sql`user_scoring_system`, (column) => column.notNull())
    .addColumn("updated_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addColumn("username", "text", (column) => column.notNull().unique())
    .execute();

  await database.schema
    .createTable("databases")
    .addColumn("id", "uuid", (column) => column.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("created_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addColumn("kind", sql`database_kind`, (column) => column.notNull())
    .addColumn("path", "text", (column) => column.notNull())
    .addColumn("updated_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addColumn("user_id", "uuid", (column) =>
      column.references("users.id").notNull().onDelete("cascade"),
    )
    .addUniqueConstraint("databases_path_and_user_id_unique", ["path", "user_id"])
    .execute();

  await database.schema
    .createTable("models")
    .addColumn("id", "uuid", (column) => column.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("brand_id", "uuid", (column) =>
      column.references("brands.id").notNull().onDelete("cascade"),
    )
    .addColumn("created_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addColumn("name", "text", (column) => column.notNull())
    .addColumn("updated_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addUniqueConstraint("models_brand_id_and_name_unique", ["brand_id", "name"])
    .execute();

  await database.schema
    .createTable("evaluations")
    .addColumn("id", "uuid", (column) => column.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("created_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addColumn("database_id", "uuid", (column) =>
      column.references("databases.id").notNull().onDelete("cascade"),
    )
    .addColumn("model_id", "uuid", (column) =>
      column.references("models.id").notNull().onDelete("cascade"),
    )
    .addColumn("review_score", "real")
    .addColumn("review_url", "text")
    .addColumn("shop_url", "text")
    .addColumn("updated_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .execute();

  await database.schema
    .createTable("jwt_authorization_tokens")
    .addColumn("id", "uuid", (column) => column.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("created_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addColumn("updated_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addColumn("user_id", "uuid", (column) =>
      column.references("users.id").notNull().onDelete("cascade"),
    )
    .addColumn("token", "text", (column) => column.notNull())
    .execute();

  await database.schema
    .createTable("jwt_magic_link_tokens")
    .addColumn("id", "uuid", (column) => column.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("created_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addColumn("token", "text", (column) => column.notNull())
    .addColumn("user_id", "uuid", (column) =>
      column.references("users.id").notNull().unique().onDelete("cascade"),
    )
    .execute();

  await database.schema
    .createTable("jwt_refresh_tokens")
    .addColumn("id", "uuid", (column) => column.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("created_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addColumn("updated_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addColumn("user_id", "uuid", (column) =>
      column.references("users.id").notNull().onDelete("cascade"),
    )
    .addColumn("token", "text", (column) => column.notNull())
    .execute();

  await database.schema
    .createTable("measurements")
    .addColumn("id", "uuid", (column) => column.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("created_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .addColumn("evaluation_id", "uuid", (column) =>
      column.references("evaluations.id").notNull().onDelete("cascade"),
    )
    .addColumn("kind", sql`measurement_kind`, (column) => column.notNull())
    .addColumn("label", "text", (column) => column.notNull())
    .addColumn("left_channel", "text", (column) => column.notNull())
    .addColumn("right_channel", "text", (column) => column.notNull())
    .addColumn("updated_at", "timestamp", (column) =>
      column.notNull().defaultTo(sql`clock_timestamp()`),
    )
    .execute();
}
