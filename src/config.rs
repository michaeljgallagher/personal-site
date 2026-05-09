use std::env;

use anyhow::Result;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub bind_addr: String,
}

impl AppConfig {
    pub fn from_env() -> Result<Self> {
        Ok(Self {
            bind_addr: env::var("BIND_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".to_string()),
        })
    }
}
