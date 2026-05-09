use askama::Template;
use askama_axum::IntoResponse;
use axum::http::StatusCode;
use axum::response::Response;

#[derive(Template)]
#[template(path = "404.html")]
struct NotFoundTemplate;

pub fn not_found_response() -> Response {
    (StatusCode::NOT_FOUND, NotFoundTemplate).into_response()
}
