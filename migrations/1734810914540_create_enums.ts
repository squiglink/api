import type { Kysely } from "kysely";

export async function up(database: Kysely<any>): Promise<void> {
  await database.schema
    .createType("database_kind")
    .asEnum(["earbuds", "headphones", "iems"])
    .execute();

  await database.schema
    .createType("measurement_kind")
    .asEnum(["frequency_response", "harmonic_distortion", "impedance", "sound_isolation"])
    .execute();

  await database.schema
    .createType("user_scoring_system")
    .asEnum(["five_star", "hundred_point", "ten_point_decimal", "ten_point"])
    .execute();
}
