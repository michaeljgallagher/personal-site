# CLAUDE.md

Project context for Claude Code sessions on this repo.

## What this is

Personal website for Michael Gallagher — a one-pager. Rust port of a Flask app at `/home/mgallag/repos/personal-website`. The Rust rewrite intentionally drops the database and the projects/contact features.

## Stack

- **Web:** Axum 0.7
- **Templates:** Askama 0.12 (compile-time-checked Jinja-like)
- **Styling:** Tailwind 3.4 via the standalone CLI binary (no Node at runtime). Custom `accent` and `ink` palettes in `tailwind.config.js` (accent ≈ #67568c, ink = neutrals slightly tinted toward the accent). Body font is Geist Sans, loaded from Google Fonts.
- **Config:** env vars via `dotenvy` (auto-loads `.env` in dev)

## Architecture

- `src/main.rs` — router assembly, graceful shutdown
- `src/config.rs` — `AppConfig::from_env()` (just `BIND_ADDR`)
- `src/error.rs` — `not_found_response()` rendering `404.html`
- `src/routes/home.rs` — single `/` handler

The home template extends `templates/base.html`. An inline pre-paint script reads `localStorage.theme` if set and otherwise falls back to `prefers-color-scheme`; if dark, it adds `class="dark"` to `<html>` before paint to avoid FOUC. A second script at the end of `<body>` wires the toggle button and persists the choice to `localStorage`.

The base also embeds the orb (`<svg id="orb">`) and loads `static/orb.js` — see the Orb section.

## Conventions

- **No database, no shared state.** Adding either is a real architectural shift — raise it explicitly first.
- **Askama is compile-time.** Template changes require `cargo build`. Errors in templates surface as Rust compile errors.
- **Tailwind is build-time.** New classes in templates require rebuilding `static/tailwind.css`:
  ```
  ./bin/tailwindcss -c tailwind.config.js -i assets/css/input.css -o static/tailwind.css --minify
  ```
  Add `--watch` during template work.
- **All config is env-vars.** Add to `AppConfig` and `.env.example`.

## Orb

A draggable accent-colored circle that pushes nearby content around. `static/orb.js` animates `<svg id="orb">` (in `templates/base.html`) with a small physics loop: drift, edge-bounce, friction, idle nudges, pointer-drag with `setPointerCapture`.

Two opt-in classes drive what gets pushed:

- `.orb-text` — at startup, text inside is split word-by-word into `<span class="orb-word">`; each word is repulsed individually with center-distance falloff.
- `.orb-push` — element is pushed as a single block, using closest-point-on-bounds distance so wide elements (h1, buttons) react along their full extent. Currently applied to the h1, GitHub/Resume buttons, theme toggle, footer copyright, and the 404 lines.

Base positions are cached in page coords on load (and on resize), so the per-frame loop does zero DOM reads. Tunables (`PUSH_RADIUS`, `PUSH_FORCE`, `FRICTION`, `BOUNCE`, `IDLE_NUDGE`, `SMOOTH`) sit at the top of `orb.js`. Honors `prefers-reduced-motion` (orb appears, doesn't drift).

The orb is an SVG `<circle>`, not a clipped div — vector rendering avoids the sub-pixel rasterization artifacts that `clip-path: circle()` produces under animated transforms.

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
