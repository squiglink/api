use anyhow::Error;
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

pub struct ApplicationError(Error);

impl IntoResponse for ApplicationError {
    fn into_response(self) -> Response {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to process the request: {}", self.0),
        )
            .into_response()
    }
}

impl<E> From<E> for ApplicationError
where
    E: Into<Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}
