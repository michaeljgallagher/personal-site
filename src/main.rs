mod config;
mod error;
mod routes;

use std::net::SocketAddr;

use anyhow::{Context, Result};
use axum::routing::get;
use axum::Router;
use tower_http::compression::CompressionLayer;
use tower_http::services::ServeDir;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{fmt, prelude::*, EnvFilter};

use crate::config::AppConfig;
use crate::error::not_found_response;

#[tokio::main]
async fn main() -> Result<()> {
    let _ = dotenvy::dotenv();

    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .with(fmt::layer())
        .init();

    let config = AppConfig::from_env().context("loading config")?;

    let app = Router::new()
        .route("/", get(routes::home::get))
        .nest_service("/static", ServeDir::new("static"))
        .fallback(|| async { not_found_response() })
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new());

    let addr: SocketAddr = config
        .bind_addr
        .parse()
        .with_context(|| format!("parsing BIND_ADDR={}", config.bind_addr))?;

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .with_context(|| format!("binding {addr}"))?;
    tracing::info!("listening on http://{addr}");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .context("server error")?;

    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c().await.ok();
    };

    #[cfg(unix)]
    let terminate = async {
        if let Ok(mut sig) =
            tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
        {
            sig.recv().await;
        }
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}
