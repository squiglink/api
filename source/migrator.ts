import { Migrator, type Migration, type MigrationResultSet } from "kysely";
import { basename } from "node:path";
import { database } from "./database.js";

const migrator = new Migrator({
  db: database,
  provider: {
    getMigrations: async () =>
      Object.fromEntries(
        Object.entries<Migration>(
          (import.meta as any).glob("../migrations/*.ts", { eager: true }),
        ).map(([path, migration]) => [basename(path, ".ts"), migration]),
      ),
  },
});

async function run(method: () => Promise<MigrationResultSet>) {
  const { error } = await method();
  if (error) throw error;
}

export async function migrate(steps?: number) {
  if (steps === undefined) {
    await run(() => migrator.migrateToLatest());
  } else {
    for (let i = 0; i < steps; i++) {
      await run(() => migrator.migrateUp());
    }
  }
  await database.destroy();
}

export async function rollback(steps = 1) {
  for (let i = 0; i < steps; i++) {
    await run(() => migrator.migrateDown());
  }
  await database.destroy();
}
