import databaseCreate from "./commands/database-create.js";
import databaseMigrate from "./commands/database-migrate.js";
import databaseRollback from "./commands/database-rollback.js";
import start from "./commands/start.js";
import { Command } from "commander";

const program = new Command();

program.name("server");

program.command("database-create").description("Create the database.").action(databaseCreate);

program
  .command("database-migrate")
  .description("Migrate the database.")
  .option("--step <n>", "number of steps (default: all)", Number)
  .action((options) => databaseMigrate(options.step));

program
  .command("database-rollback")
  .description("Rollback migrations.")
  .option("--step <n>", "number of steps", "1")
  .action((options) => databaseRollback(Number(options.step)));

program.command("start").description("Start the application.").action(start);

await program.parseAsync();
