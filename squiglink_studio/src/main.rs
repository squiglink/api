#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    let router = axum::Router::new();

    let tcp_listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(tcp_listener, router).await?;

    Ok(())
}
