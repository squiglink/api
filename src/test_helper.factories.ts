import { createJwtToken } from "./services/create_jwt_token.js";
import configuration from "./configuration.js";
import type { Database, DatabaseKind, MeasurementKind, UserScoringSystem } from "./types.js";
import type { Kysely, Transaction } from "kysely";

export async function insertBrand(
  databaseOrTransaction: Kysely<Database> | Transaction<Database>,
  values: {
    created_at?: Date;
    id?: string;
    name?: string;
    updated_at?: Date;
  } = {},
): Promise<{
  created_at: Date;
  id: string;
  name: string;
  updated_at: Date;
}> {
  return await databaseOrTransaction
    .insertInto("brands")
    .values({
      ...{
        name: values.name || "Brand",
      },
      ...values,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function insertDatabase(
  databaseOrTransaction: Kysely<Database> | Transaction<Database>,
  values: {
    created_at?: Date;
    id?: string;
    kind?: DatabaseKind;
    path?: string;
    updated_at?: Date;
    user_id?: string;
  } = {},
): Promise<{
  created_at: Date;
  id: string;
  kind: DatabaseKind;
  path: string;
  updated_at: Date;
  user_id: string;
}> {
  return await databaseOrTransaction
    .insertInto("databases")
    .values({
      ...{
        kind: (values.kind as DatabaseKind) || "earbuds",
        path: values.path || "/",
        user_id: values.user_id || (await insertUser(databaseOrTransaction)).id,
      },
      ...values,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function insertEvaluation(
  databaseOrTransaction: Kysely<Database> | Transaction<Database>,
  values: {
    created_at?: Date;
    id?: string;
    model_id?: string;
    review_score?: number | null;
    review_url?: string | null;
    shop_url?: string | null;
    updated_at?: Date;
  } = {},
): Promise<{
  created_at: Date;
  id: string;
  model_id: string;
  review_score: number | null;
  review_url: string | null;
  shop_url: string | null;
  updated_at: Date;
}> {
  return await databaseOrTransaction
    .insertInto("evaluations")
    .values({
      ...{
        model_id: values.model_id || (await insertModel(databaseOrTransaction)).id,
        review_score: values.review_score || 5,
        review_url: values.review_url || "https://metu.be",
        shop_url: values.shop_url || "https://squig.link",
      },
      ...values,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function insertJwtAuthorizationToken(
  databaseOrTransaction: Kysely<Database> | Transaction<Database>,
  values: {
    created_at?: Date;
    id?: string;
    token?: string;
    updated_at?: Date;
    user_id?: string;
  } = {},
): Promise<{
  created_at: Date;
  id: string;
  token: string;
  updated_at: Date;
  user_id: string;
}> {
  return await databaseOrTransaction
    .insertInto("jwt_authorization_tokens")
    .values({
      ...{
        token: await createJwtToken(configuration.jwtExpirationTimeAuthorizationToken * 1000),
        user_id: values.user_id || (await insertUser(databaseOrTransaction)).id,
      },
      ...values,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function insertJwtMagicLinkToken(
  databaseOrTransaction: Kysely<Database> | Transaction<Database>,
  values: {
    created_at?: Date;
    id?: string;
    token?: string;
    user_id?: string;
  } = {},
): Promise<{
  created_at: Date;
  id: string;
  token: string;
  user_id: string;
}> {
  return await databaseOrTransaction
    .insertInto("jwt_magic_link_tokens")
    .values({
      ...{
        token: await createJwtToken(configuration.jwtExpirationTimeAuthorizationToken * 1000),
        user_id: values.user_id || (await insertUser(databaseOrTransaction)).id,
      },
      ...values,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function insertJwtRefreshToken(
  databaseOrTransaction: Kysely<Database> | Transaction<Database>,
  values: {
    created_at?: Date;
    id?: string;
    token?: string;
    updated_at?: Date;
    user_id?: string;
  } = {},
): Promise<{
  created_at: Date;
  id: string;
  token: string;
  updated_at: Date;
  user_id: string;
}> {
  return await databaseOrTransaction
    .insertInto("jwt_refresh_tokens")
    .values({
      ...{
        token: await createJwtToken(configuration.jwtExpirationTimeAuthorizationToken * 1000),
        user_id: values.user_id || (await insertUser(databaseOrTransaction)).id,
      },
      ...values,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function insertModel(
  databaseOrTransaction: Kysely<Database> | Transaction<Database>,
  values: {
    brand_id?: string;
    created_at?: Date;
    id?: string;
    name?: string;
    updated_at?: Date;
  } = {},
): Promise<{
  brand_id: string;
  created_at: Date;
  id: string;
  name: string;
  updated_at: Date;
}> {
  return await databaseOrTransaction
    .insertInto("models")
    .values({
      ...{
        brand_id: values.brand_id || (await insertBrand(databaseOrTransaction)).id,
        name: values.name || "Model",
      },
      ...values,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function insertUser(
  databaseOrTransaction: Kysely<Database> | Transaction<Database>,
  values: {
    created_at?: Date;
    display_name?: string;
    email?: string;
    id?: string;
    scoring_system?: UserScoringSystem;
    updated_at?: Date;
    username?: string;
  } = {},
): Promise<{
  created_at: Date;
  display_name: string;
  email: string;
  id: string;
  scoring_system: UserScoringSystem;
  updated_at: Date;
  username: string;
}> {
  return await databaseOrTransaction
    .insertInto("users")
    .values({
      ...{
        display_name: values.display_name || "User",
        email: values.email || `${Math.random().toString(36).substring(2)}@test.com`,
        scoring_system: (values.scoring_system as UserScoringSystem) || "five_star",
        username: values.username || "user",
      },
      ...values,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function insertMeasurement(
  databaseOrTransaction: Kysely<Database> | Transaction<Database>,
  values: {
    created_at?: Date;
    database_id?: string;
    id?: string;
    kind?: MeasurementKind;
    label?: string;
    left_channel?: string;
    model_id?: string;
    right_channel?: string;
    updated_at?: Date;
  } = {},
): Promise<{
  created_at: Date;
  database_id: string;
  id: string;
  kind: MeasurementKind;
  label: string;
  left_channel: string;
  model_id: string;
  right_channel: string;
  updated_at: Date;
}> {
  return await databaseOrTransaction
    .insertInto("measurements")
    .values({
      ...{
        database_id: values.database_id || (await insertDatabase(databaseOrTransaction)).id,
        kind: (values.kind as MeasurementKind) || "frequency_response",
        label: values.label || "Label",
        left_channel: values.left_channel || "123",
        model_id: values.model_id || (await insertModel(databaseOrTransaction)).id,
        right_channel: values.right_channel || "123",
      },
      ...values,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}
