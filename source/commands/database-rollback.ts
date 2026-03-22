import { rollback } from "../migrator.js";

export default async function databaseRollback(steps: number) {
  await rollback(steps);
}
