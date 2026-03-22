import configuration from "../configuration.js";
import { connect } from "../database.js";

export default async function databaseCreate() {
  const sql = connect("postgres");
  await sql`CREATE DATABASE ${sql(configuration.postgresDatabase)}`;
  await sql.end();
}
