# BEH4VIOR: project status

Last updated 2026-11-14. — signed: GPT-6 @ ChatGPT · 2026-11-14 (preserving older notes below)

## 2026-11-14 offline export (PR #7 merged)

- Standalone HTML build: `npm run build:offline` creates `dist/BEH4VIOR-Fourfold-Offline.html` with local scripts and a no-network CSP. GitHub CI artifact `beh4vior-offline-app` includes the editable HTML and a sample printable PDF. Open HTML in a browser; use Print / Save as PDF.
- 14 tests passed, including the offline bundle test. GitHub Actions run 43658179672 printed both the served and offline versions in Chrome; each was one US-letter page; downloaded and visually inspected the rendered offline PDF.
- The offline HTML **does not require TAKATAK-V1 login** and can work on a trusted device, but it does not synchronize across devices or with school. Local browser storage may be unavailable for `file://` pages; users should print/save before closing.
- BEH4VIOR's main 5×20 saved goals remain separate from the standalone 10+30+30+30 form (issue #6). Hosted deployment, privacy approval, Android print and real TAKATAK authentication remain pending (issue #5).

## 2026-11-14 four-fold worksheet release (PR #4; not yet deployed)

- Added a browser-local four-fold worksheet editor at `/foldable` and a Print card link from the tracker. One letter-size sheet, four quadrants, editable child's name, date, motivation, previous score, four goals (10 + 30 + 30 + 30), the two- or three-choice printed faces and a single dotted name tracing row.
- The score logic and tracing are independently tested; 13 Node tests pass. GitHub Actions checks `npm test`, JavaScript syntax, a real headless Chrome PDF render, and a one-page US-letter assertion (run 43657473886). No real child data in source or test fixtures. The page makes no API writes.
- **This is not yet live**. Headless Chrome print proof passed and was inspected visually (one page, four upright fold panels); manual physical-paper and Android-device checks, cross-device sync, teacher roles, and production privacy sign-off are still pending. The server-side tracker still uses the original five goals and must not be described as having switched to four.
- Both bridge PRs BEH4VIOR #1 and TAKATAK-V1 #285 were merged on November 11; production deployment and real inter-service sign-in still require confirmation.

## What exists

- **The tracker page** (`app/index.html`, `app/app.js`), three views:
  - **The five**: the day's five goals, a star each, the day's percentage, a face to tap per goal, goal wording editable in place.
  - **School sheet**: sixteen parts of the day as on the paper sheet, four marks each, a note per part, "I am proud of", "Notes", and a button that builds the next school day's five.
  - **Days**: every day with its score and faces, and the child's first name.
- **A Node.js server** (`server.js`, `lib/`): serves the page, a small JSON API, and the sign-in handoff with TAKATAK-V1. Every row is scoped to the signed-in adult's master identity. Postgres in production.
- **Two storage adapters** for the page: `storage-server.js` (the real one) and `storage-local.js` (demo, invented data, browser only).
- **V1 side**: launch and exchange routes, dashboard entry and nav item, merged in takatak-v1 PR #285 on 2026-11-11; deployment still unverified.
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
