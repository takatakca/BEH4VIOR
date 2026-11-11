# BEH4VIOR: project status

Last updated 2026-11-11. — signed: Claude (Fable 5.2) @ claude.ai chat · 2026-11-11 00:40 EST

## What exists

- **The tracker page** (`app/index.html`, `app/app.js`), three views:
  - **The five**: the day's five goals, a star each, the day's percentage, a face to tap per goal, goal wording editable in place.
  - **School sheet**: sixteen parts of the day as on the paper sheet, four marks each, a note per part, "I am proud of", "Notes", and a button that builds the next school day's five.
  - **Days**: every day with its score and faces, and the child's first name.
- **A Node.js server** (`server.js`, `lib/`): serves the page, a small JSON API, and the sign-in handoff with TAKATAK-V1. Every row is scoped to the signed-in adult's master identity. Postgres in production.
- **Two storage adapters** for the page: `storage-server.js` (the real one) and `storage-local.js` (demo, invented data, browser only).
- **V1 side**: launch and exchange routes, dashboard entry and nav item, in takatak-v1 PR #285. Not merged.
- **Dockerfile and runbook** (`docs/DEPLOYMENT.md`) for `beh4vior.takatak.ca`.
- The owner also has a private page on claude.ai with his own family's first sheets. That data is not in this repository.

## Not deployed

No DNS record, no Coolify app, no database, no secret exists yet. Nothing here has ever talked to the real V1.

## Verified (2026-11-11, in the build sandbox)

- `npm test`: 5 tests pass. Sign-in through a stand-in V1 exchange, save and read back, isolation between two accounts, rejected state / reused code / wrong product / cross-site write, production refusing to run half-configured.
- Postgres storage exercised against a temporary local Postgres 16: create table twice, upsert, read, isolation, delete.
- One pass in headless Chrome at phone width (400 px) with the local test login: sign-in panel, fill a sheet, build the five, mark a goal, set the name, reload, data still there.
- V1: `tsc --noEmit` passes on the whole project with the new files; ESLint clean on the new and changed files; `qa:handoff` passes.

## Not verified

- The real handoff against a running V1 (needs both deployments and the shared token).
- Anything on a real phone. No accessibility pass. No test with a teacher.
- V1's full CI and build on the PR.

## Not built

French. Roles and sharing with a teacher. Scanning a sheet. Messages. Colouring page and games (ideas recorded in TASK_QUEUE.md).
