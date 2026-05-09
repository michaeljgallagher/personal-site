# syntax=docker/dockerfile:1.7
ARG RUST_VERSION=1.95
ARG TAILWIND_VERSION=v3.4.17

FROM rust:${RUST_VERSION}-bookworm AS builder
WORKDIR /app

# Cache dependency build
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo 'fn main(){}' > src/main.rs && cargo build --release && rm -rf src

# Build the application
COPY src ./src
COPY templates ./templates
RUN touch src/main.rs && cargo build --release

# Build CSS using the standalone tailwindcss binary
ARG TAILWIND_VERSION
ADD --chmod=755 https://github.com/tailwindlabs/tailwindcss/releases/download/${TAILWIND_VERSION}/tailwindcss-linux-x64 /usr/local/bin/tailwindcss
COPY tailwind.config.js ./
COPY assets ./assets
COPY static ./static
RUN tailwindcss -c tailwind.config.js -i assets/css/input.css -o static/tailwind.css --minify

FROM gcr.io/distroless/cc-debian12:nonroot
WORKDIR /app
COPY --from=builder /app/target/release/personal-website /app/personal-website
COPY --from=builder /app/static /app/static
COPY --from=builder /app/templates /app/templates

ENV BIND_ADDR=0.0.0.0:8080
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/app/personal-website"]
