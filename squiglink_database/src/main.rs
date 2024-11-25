mod commands;
use anyhow::Error;
use clap::Subcommand;

#[derive(clap::Parser, Debug)]
#[command(
    disable_help_subcommand = true,
    disable_version_flag = true,
    version = env!("CARGO_PKG_VERSION")
)]
struct CommandParser {
    /// Show version
    #[arg(action = clap::builder::ArgAction::Version, short, long)]
    version: (),

    #[command(subcommand)]
    command: Command,
}

#[derive(Debug, Subcommand)]
enum Command {
    /// Migrate the database
    Migrate(commands::migrate::Command),

    /// Seed the database
    Seed(commands::seed::Command),
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    let command_parser: CommandParser = clap::Parser::parse();
    match command_parser.command {
        Command::Migrate(command) => command.execute().await?,
        Command::Seed(command) => command.execute().await?,
    }
    Ok(())
}
