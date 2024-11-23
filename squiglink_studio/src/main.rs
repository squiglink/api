use axum::routing::get;

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    let router = axum::Router::new().route("/", get(root));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, router).await?;

    Ok(())
}

async fn root() -> &'static str {
    "Hello, world!"
}
