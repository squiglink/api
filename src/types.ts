import type { ColumnType } from "kysely";

export type DatabaseKind = "earbuds" | "headphones" | "iems";

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export type MeasurementKind =
  | "frequency_response"
  | "harmonic_distortion"
  | "impedance"
  | "sound_isolation";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type UserScoringSystem = "five_star" | "hundred_point" | "ten_point" | "ten_point_decimal";

export interface Brands {
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  name: string;
  updated_at: Generated<Timestamp>;
}

export interface Databases {
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  kind: DatabaseKind;
  path: string;
  updated_at: Generated<Timestamp>;
  user_id: string;
}

export interface Evaluations {
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  model_id: string;
  review_score: number | null;
  review_url: string | null;
  shop_url: string | null;
  updated_at: Generated<Timestamp>;
  user_id: string;
}

export interface JwtAccessTokens {
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  token: string;
  updated_at: Generated<Timestamp>;
  user_id: string;
}

export interface JwtMagicLinkTokens {
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  token: string;
  updated_at: Generated<Timestamp>;
  user_id: string;
}

export interface JwtRefreshTokens {
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  token: string;
  updated_at: Generated<Timestamp>;
  user_id: string;
}

export interface Measurements {
  created_at: Generated<Timestamp>;
  database_id: string;
  id: Generated<string>;
  kind: MeasurementKind;
  label: string;
  left_channel: string | null;
  model_id: string;
  right_channel: string | null;
  updated_at: Generated<Timestamp>;
}

export interface Models {
  brand_id: string;
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  name: string;
  updated_at: Generated<Timestamp>;
}

export interface Users {
  created_at: Generated<Timestamp>;
  display_name: string;
  email: string;
  id: Generated<string>;
  scoring_system: UserScoringSystem;
  updated_at: Generated<Timestamp>;
  username: string;
}

export interface Database {
  brands: Brands;
  databases: Databases;
  evaluations: Evaluations;
  jwt_access_tokens: JwtAccessTokens;
  jwt_magic_link_tokens: JwtMagicLinkTokens;
  jwt_refresh_tokens: JwtRefreshTokens;
  measurements: Measurements;
  models: Models;
  users: Users;
}
