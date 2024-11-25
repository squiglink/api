use anyhow::Error;
use clap::Parser;
use std::env;

#[derive(Debug, Parser)]
pub struct Command {}

mod embedded {
    use refinery::embed_migrations;
    embed_migrations!("migrations");
}

impl Command {
    pub async fn execute(&self) -> Result<(), Error> {
        for database_url in [
            env::var("SQUIGLINK_DEV_DATABASE_URL")?,
            env::var("SQUIGLINK_TEST_DATABASE_URL")?,
        ] {
            println!("Connecting to `{}`...", database_url);
            let (mut client, connection) =
                tokio_postgres::connect(&database_url, tokio_postgres::NoTls).await?;
            tokio::spawn(async move {
                if let Err(err) = connection.await {
                    eprintln!("{}", err);
                }
            });

            let report = embedded::migrations::runner()
                .run_async(&mut client)
                .await?;
            for migration in report.applied_migrations() {
                println!("Executed a migration: `{}`.", migration);
            }
        }

        Ok(())
    }
}
