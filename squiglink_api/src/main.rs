mod application_error;
mod application_state;
mod entities;
mod requests;
use axum::{routing::get, Router};
use std::env;
use std::sync::Arc;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
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

    let application_state = Arc::new(application_state::ApplicationState {
        postgres_client: client,
    });

    let tcp_listener = TcpListener::bind("0.0.0.0:3000").await?;
    let router = Router::new()
        .route("/measurements", get(requests::measurements_index::handler))
        .route(
            "/measurements/{id}",
            get(requests::measurements_show::handler),
        )
        .with_state(application_state);
    axum::serve(tcp_listener, router).await?;

    Ok(())
}
