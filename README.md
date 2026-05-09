# personal-site

My personal website, in Rust. A one-pager.

Stack: [Axum](https://github.com/tokio-rs/axum) + [Askama](https://github.com/djc/askama) for server-rendered HTML, [Tailwind CSS](https://tailwindcss.com) for styling.

## Layout

```
src/         Axum app (routes, config)
templates/   Askama templates
assets/css/  Tailwind input
static/      Build output (tailwind.css), orb.js (hand-written vanilla JS, not built), resume.pdf
bin/         Local copy of the standalone tailwindcss binary (gitignored)
```

## Develop

Prerequisites: Rust stable, `curl` for the one-time tailwindcss download.

```sh
# 1. Get the standalone tailwindcss binary (one-time)
mkdir -p bin
curl -sSL -o bin/tailwindcss \
  https://github.com/tailwindlabs/tailwindcss/releases/download/v3.4.17/tailwindcss-linux-x64
chmod +x bin/tailwindcss

# 2. Build the CSS
./bin/tailwindcss -c tailwind.config.js -i assets/css/input.css -o static/tailwind.css --minify

# 3. Configure env (copy and edit)
cp .env.example .env

# 4. Run
cargo run
```

For live CSS rebuilds during template work: `./bin/tailwindcss ... --watch`.

## Configuration

All config is via environment variables (`.env` is loaded automatically in dev):

| Var         | Default        | Notes                     |
| ----------- | -------------- | ------------------------- |
| `BIND_ADDR` | `0.0.0.0:8080` |                           |
| `RUST_LOG`  | `info`         | tracing-subscriber filter |

## Tests

```sh
cargo test
```

## Docker

```sh
docker build -t personal-website .
docker run --rm -p 8080:8080 --env-file .env personal-website
```

The Dockerfile is multi-stage: builds Rust + Tailwind CSS, copies the binary and assets into a distroless `nonroot` runtime image.
