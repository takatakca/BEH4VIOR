# BEH4VIOR: deployment

— signed: Claude (Fable 5.2) @ claude.ai chat · 2026-11-11 00:40 EST

**Nothing is deployed.** The agent that wrote this has no access to DNS, Coolify or any secret. This is the runbook for the owner's developer. Target: `https://beh4vior.takatak.ca`, private test for the owner's own account first.

## What runs

One Node 22 container (`Dockerfile`, port 3000, health at `/healthz`) and one Postgres database. The app creates its single table (`beh4vior_docs`) at startup. No build step.

## Order of work

1. **Merge and deploy the V1 side first** (takatak-v1 PR #285: launch and exchange routes, dashboard entry). Follow V1's release rules and the owner's release switch.
2. **Generate one service token** (long random, 32+ characters). Set it in V1 as `TAKATAK_BEH4VIOR_SERVICE_TOKEN`.
3. **V1 runtime variables:**
   - `TAKATAK_BEH4VIOR_URL=https://beh4vior.takatak.ca`
   - `BEH4VIOR_EXPERIENCE_CALLBACK_URL=https://beh4vior.takatak.ca/auth/callback`
   - `TAKATAK_BEH4VIOR_SERVICE_TOKEN=<the token>`
4. **DNS:** `beh4vior.takatak.ca` → the Coolify server (same target as the other Coolify apps).
5. **Coolify:** new application from this repository, branch `main`, Dockerfile build, domain `https://beh4vior.takatak.ca` (TLS by Coolify), health check path `/healthz`. Add a Postgres database in the same project, with backups on.
6. **BEH4VIOR runtime variables** (see `.env.example`):
   - `NODE_ENV=production`
   - `BEH4VIOR_PUBLIC_ORIGIN=https://beh4vior.takatak.ca`
   - `TAKATAK_BEH4VIOR_LAUNCH_URL=https://takatak.ca/api/experiences/beh4vior/launch`
   - `TAKATAK_BEH4VIOR_EXCHANGE_URL=https://takatak.ca/api/experiences/beh4vior/exchange`
   - `TAKATAK_BEH4VIOR_SERVICE_TOKEN=<the same token>`
   - `BEH4VIOR_SESSION_SECRET=<a different random value, 32+ characters>`
   - `DATABASE_URL=<the internal Postgres URL from Coolify>`
7. **Smoke test, in this order:**
   - `GET https://beh4vior.takatak.ca/healthz` answers `{"ok":true,"signIn":"takatak-v1","storage":"postgres"}`. A 503 names what is missing.
   - Signed out, the page shows "Sign in with TAKATAK" and `/api/state` answers 401.
   - Sign in with the owner's TAKATAK account: lands back on the tracker, "Signed in as …" shows.
   - Tap faces on School sheet, build the five, reload: still there. Open on a second device with the same account: same data.
   - Sign in with a second TAKATAK account: it sees an empty tracker, never the first account's sheets.

## Rules

- In production the app refuses to start half-configured: no file storage, no demo mode, no test login.
- Request bodies are never logged. Do not add request logging that prints bodies: they hold a child's sheet.
- Any V1 account can sign in and gets its own empty space. That is acceptable for a private test because the address is unlisted and nothing is shared between accounts, but do not announce the address before the consent and privacy gate in TASK_QUEUE.md is closed.
- Rollback: redeploy the previous image. The database schema is one table and has not changed.

## Local

- `npm run demo`: page with invented example data, saved in the browser.
- `npm run dev`: real server with a local test account and a JSON file in `data/`.
- `npm test`: sign-in bridge, isolation between accounts, input cleaning, production refusals.
