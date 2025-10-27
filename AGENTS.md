# Repository Guidelines

## Project Structure & Module Organization
This repo hosts a lightweight Express proxy that forwards transcript prompts to Anthropic and serves a static frontend for summarising Loom or Zoom recordings. The root folder contains `server.js` for routing and HTTPS calls, while `index.html`, `script.js`, and `style.css` deliver the browser UI. Place secrets such as `ANTHROPIC_API_KEY` in `.env.local`; no framework-specific folders are used, so keep additional modules close to their entrypoints and document sizable additions.

## Build, Test & Development Commands
Install dependencies with `npm install`. Use `npm run dev` for iterative work; Nodemon restarts the server when you touch backend files. `npm start` mirrors production by launching `node server.js` on port 3000. When debugging HTTPS calls, use `NODE_DEBUG=http` or curl against `http://localhost:3000/api/claude` with a sample payload to verify headers.

## Coding Style & Naming Conventions
Adhere to four-space indentation in both server and client scripts, keeping CommonJS requires on the backend and browser globals on the frontend. Keep prompts, UI copy, and comments in German unless a feature clearly targets a different audience. Name new helpers descriptively (`formatTranscriptSection`, `renderTimeline`) and prefer small, single-purpose functions over deeply nested callbacks; mirror existing casing (camelCase for functions, SCREAMING_SNAKE for env vars).

## Testing Guidelines
Automated tests are not yet configured. Before shipping changes, run the UI flow end-to-end: start the dev server, load `http://localhost:3000`, paste a short transcript, and confirm the summary and timestamps populate without console errors. Validate error paths by removing the API key or simulating network failures to ensure friendly alerts still surface.

## Commit & Pull Request Guidelines
Use concise, imperative commit subjects (e.g., `Refine summary prompt`) and keep body text bilingual only when necessary; the existing history is short but follows descriptive German phrasing. Every pull request should describe the problem, the solution, and manual verification steps; attach screenshots or response snippets when UI copy or API formatting changes. Link tracking issues if available and call out any follow-up tasks so reviewers can judge scope quickly.

## Security & Configuration Tips
Never commit `.env`/`.env.local` or real API keys—add new variables to `.env.example` instead. Set `ANTHROPIC_MODEL` when you need a different Claude release; the default `claude-3-5-sonnet-20241022` is current. When modifying `makeClaudeRequest`, confirm request headers still match Anthropic requirements and avoid logging entire payloads. If you introduce third-party libraries, record their purpose and required configuration in the README or this guide to keep future agents informed.
