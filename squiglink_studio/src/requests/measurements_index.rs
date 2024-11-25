use crate::application_error::ApplicationError;
use crate::application_state::ApplicationState;
use crate::entities::measurement::Measurement;
use axum::{debug_handler, extract::State, http::StatusCode, Json};
use std::sync::Arc;

#[debug_handler]
pub async fn handler(
    State(state): State<Arc<ApplicationState>>,
) -> Result<(StatusCode, Json<Vec<Measurement>>), ApplicationError> {
    let measurements: Vec<Measurement> = state
        .postgres_client
        .query("select * from measurements", &[])
        .await?
        .into_iter()
        .map(|row| row.into())
        .collect();

    Ok((StatusCode::OK, Json(measurements)))
}
