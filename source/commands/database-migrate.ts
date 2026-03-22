import { migrate } from "../migrator.js";

export default async function databaseMigrate(steps?: number) {
  await migrate(steps);
}
