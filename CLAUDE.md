# CLAUDE.md

Project context for Claude Code sessions on this repo.

## What this is

Personal website for Michael Gallagher — a one-pager. Rust port of a Flask app at `/home/mgallag/repos/personal-website`. The Rust rewrite intentionally drops the database and the projects/contact features.

## Stack

- **Web:** Axum 0.7
- **Templates:** Askama 0.12 (compile-time-checked Jinja-like)
- **Styling:** Tailwind 3.4 via the standalone CLI binary (no Node at runtime)
- **Config:** env vars via `dotenvy` (auto-loads `.env` in dev)

## Architecture

- `src/main.rs` — router assembly, graceful shutdown
- `src/config.rs` — `AppConfig::from_env()` (just `BIND_ADDR`)
- `src/error.rs` — `not_found_response()` rendering `404.html`
- `src/routes/home.rs` — single `/` handler

The home template extends `templates/base.html`. The base sets `class="dark"` on `<html>` via an inline pre-paint script (avoids FOUC); a script at the end of `<body>` wires the toggle button to `localStorage.theme`.

## Conventions

- **No database, no shared state.** Adding either is a real architectural shift — raise it explicitly first.
- **Askama is compile-time.** Template changes require `cargo build`. Errors in templates surface as Rust compile errors.
- **Tailwind is build-time.** New classes in templates require rebuilding `static/tailwind.css`:
  ```
  ./bin/tailwindcss -c tailwind.config.js -i assets/css/input.css -o static/tailwind.css --minify
  ```
  Add `--watch` during template work.
- **All config is env-vars.** Add to `AppConfig` and `.env.example`.

## Local dev

```sh
cp .env.example .env
cargo run                  # binds to BIND_ADDR (default 0.0.0.0:8080)
```

The `bin/tailwindcss` binary is gitignored. Re-download with the curl command in `README.md` or pull from a fresh `docker build`.

## Out of scope (raise before adding)

- Database / admin UI
- Blog or `/posts`
- Projects page or contact form (intentionally removed)
- CI workflows
- Sitemap / RSS / OG image generation

## Tests

`cargo test` — currently no tests.
