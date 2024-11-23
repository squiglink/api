mod application_error;
mod application_state;
mod requests;
use application_state::ApplicationState;
use axum::routing::get;
use std::sync::Arc;

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    let (client, connection) = tokio_postgres::connect(
        &std::env::var("SQUIGLINK_DEV_DATABASE_URL")?,
        tokio_postgres::NoTls,
    )
    .await?;
    tokio::spawn(async move {
        if let Err(err) = connection.await {
            eprintln!("{}", err);
        }
    });

    let application_state = Arc::new(ApplicationState {
        postgres_client: client,
    });

    let router = axum::Router::new()
        .route(
            "/measurements/{id}",
            get(requests::measurements_show::handler),
        )
        .with_state(application_state);

    let tcp_listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(tcp_listener, router).await?;

    Ok(())
}
