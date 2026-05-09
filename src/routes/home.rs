use askama::Template;
use askama_axum::IntoResponse;
use axum::response::Response;

#[derive(Template)]
#[template(path = "home.html")]
struct HomeTemplate {
    title: &'static str,
}

pub async fn get() -> Response {
    HomeTemplate {
        title: "Michael Gallagher",
    }
    .into_response()
}
