use postgres_types::{FromSql, ToSql};
use serde::Serialize;
use tokio_postgres::Row;

#[derive(Debug, FromSql, Serialize, ToSql)]
pub struct Measurement {
    channel_left: Option<String>,
    channel_right: Option<String>,
    database_id: i64,
    measurement_device_id: i64,
    label: Option<String>,
    product_id: i64,
}

impl From<Row> for Measurement {
    fn from(row: Row) -> Self {
        Self {
            channel_left: row.get("channel_left"),
            channel_right: row.get("channel_right"),
            database_id: row.get("database_id"),
            measurement_device_id: row.get("measurement_device_id"),
            label: row.get("label"),
            product_id: row.get("product_id"),
        }
    }
}
