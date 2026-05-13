# Repository Guidelines

## Project Structure & Module Organization
This repository is a build-free static web app. `index.html` contains the wizard UI, `css/style.css` holds custom styling, and `js/app.js` manages Alpine.js state and interactions. Configuration data lives in `js/data/`, while file generators for `Dockerfile`, `docker-compose.yml`, `entrypoint.sh`, `.cnb.yml`, and `.env` live in `js/generators/`. Shared browser utilities such as ZIP download and syntax highlighting are under `js/utils/`. Demo and CI validation assets are stored in `build-test/`, and screenshots live in `assets/img/`.

## Build, Test, and Development Commands
There is no bundler or package script in this repo.

- `python3 -m http.server 8000` — serve the project locally, then open `http://localhost:8000`.
- `open "index.html"` or direct browser open — quickest way to preview the generator UI.
- `docker build -f "build-test/Dockerfile" "build-test"` — validate the all-in-one sample image.
- `docker compose -f "build-test/docker-compose.yml" config --quiet` — verify Compose syntax.
- `docker run --rm -i hadolint/hadolint < "build-test/Dockerfile"` — optional Dockerfile lint check used by CI.

## Coding Style & Naming Conventions
Follow the existing no-build frontend style: plain JavaScript, Alpine.js state objects, and modular generators. Use 2-space indentation in JS, keep semicolons, and prefer single quotes. Name generator files by output target, such as `dockerfile.js` or `entrypoint.js`. Keep constants in `js/data/` and reusable helpers in `js/utils/`. Match the repository’s comment language and keep comments brief and explanatory.

## Testing Guidelines
This project relies on integration-style validation rather than unit tests. Any change that affects generated output should be checked in the browser and against `build-test/`. When updating generation logic, verify that Docker builds still pass and that Compose configuration remains valid. If UI behavior changes, include before/after screenshots in the PR.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit prefixes such as `feat:` and `fix:` with short Chinese summaries, for example `fix: 修复入口脚本执行顺序`. Keep commits focused on one behavior change. PRs should describe the user-facing impact, list verification steps, and mention whether `build-test/` fixtures were updated. Link related issues when applicable, and attach screenshots for UI or generated-output changes.

## Security & Configuration Tips
Do not commit real API keys, SSH keys, tunnel tokens, or `.env` secrets. Use placeholders in examples and rely on environment variables such as `ROOT_PASSWORD`, `CS_PASSWORD`, and `CF_TUNNEL_TOKEN`. When changing remote download URLs in `js/data/urls.js`, verify mirrors and official sources carefully.
