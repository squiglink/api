import { type Kysely } from "kysely";

export async function up(database: Kysely<any>): Promise<void> {
  await database.schema
    .createIndex("brands_name_gin_index")
    .on("brands")
    .column("name")
    .using("gin")
    .execute();

  await database.schema
    .createIndex("databases_kind_gin_index")
    .on("databases")
    .column("kind")
    .using("gin")
    .execute();

  await database.schema
    .createIndex("databases_path_gin_index")
    .on("databases")
    .column("path")
    .using("gin")
    .execute();

  await database.schema
    .createIndex("models_name_gin_index")
    .on("models")
    .column("name")
    .using("gin")
    .execute();
}
