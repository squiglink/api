use crate::application_error::ApplicationError;
use crate::application_state::ApplicationState;
use crate::entities::measurement::Measurement;
use axum::{
    debug_handler,
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;

#[debug_handler]
pub async fn handler(
    Path(id): Path<i64>,
    State(state): State<Arc<ApplicationState>>,
) -> Result<(StatusCode, Json<Measurement>), ApplicationError> {
    let measurement: Measurement = state
        .postgres_client
        .query_one("select * from measurements where id = $1 limit 1", &[&id])
        .await?
        .into();

    Ok((StatusCode::OK, Json(measurement)))
}
