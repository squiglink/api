use anyhow::Error;
use clap::Parser;
use std::env;
use std::fs;

#[derive(Debug, Parser)]
pub struct Command {}

impl Command {
    pub async fn execute(&self) -> Result<(), Error> {
        let (client, connection) = tokio_postgres::connect(
            &env::var("SQUIGLINK_DEV_DATABASE_URL")?,
            tokio_postgres::NoTls,
        )
        .await?;
        tokio::spawn(async move {
            if let Err(err) = connection.await {
                eprintln!("{}", err);
            }
        });

        client
            .batch_execute(
                &fs::read_to_string("squiglink_database/seeds/main.sql")?
                    .replace(
                        "$1",
                        &read_measurement_to_escaped_string(
                            "squiglink_database/seeds/superreview_compensation_measurement.csv",
                        )?,
                    )
                    .replace(
                        "$2",
                        &read_measurement_to_escaped_string(
                            "squiglink_database/seeds/superreview_sunrise_quartz_l.csv",
                        )?,
                    )
                    .replace(
                        "$3",
                        &read_measurement_to_escaped_string(
                            "squiglink_database/seeds/superreview_sunrise_quartz_r.csv",
                        )?,
                    ),
            )
            .await?;

        Ok(())
    }
}

fn read_measurement_to_escaped_string(path: &str) -> Result<String, Error> {
    Ok(fs::read_to_string(path)?
        .lines()
        .collect::<Vec<&str>>()
        .join("\\n"))
}
