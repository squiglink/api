import type { ColumnType } from "kysely";

export type DatabaseKind = "earbuds" | "headphones" | "iems";

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<
  string,
  bigint | number | string,
  bigint | number | string
>;

export type UserScoringSystem =
  | "five_star"
  | "hundred_point"
  | "ten_point"
  | "ten_point_decimal";

export interface Databases {
  id: Generated<Int8>;
  kind: DatabaseKind;
  path: string;
  user_id: Int8;
}

export interface Users {
  display_name: string;
  id: Generated<Int8>;
  scoring_system: UserScoringSystem;
  username: string;
}

export interface Database {
  databases: Databases;
  users: Users;
}
