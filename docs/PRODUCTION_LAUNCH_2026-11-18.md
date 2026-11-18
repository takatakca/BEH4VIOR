# BEH4VIOR production launch checklist — 2026-11-18

Status: **blocked on existing Coolify production / DNS access, credentials and private consent approval. Not live or verified.** No staging environment.

## Confirmed in GitHub
- BEH4VIOR main contains the Node 22 server (Dockerfile, port 3000, `/healthz`, PostgreSQL adapter).
- TAKATAK-V1 main contains the BEH4VIOR dashboard launch and one-time exchange routes from merged PR #285.
- This release adds a production-only, fail-closed adult identity allowlist so an unknown TAKATAK user cannot enter a private pilot.
- The four-fold editor and optional 3-goal print sheet are browser-local; the authenticated tracker still uses five daily goals.

## Production operator actions — execute only with authorized access
1. In **the existing production Coolify**, create/locate exactly one `BEH4VIOR` application from `takatakca/BEH4VIOR` branch `main`, Dockerfile build, container port 3000. Never start a duplicate or staging installation.
2. Create a private PostgreSQL database with backups and restricted inbound access. Provide its internal connection URL as a secret to BEH4VIOR; avoid logging it.
3. Add to the **BEH4VIOR app's production secret store**:
   - `NODE_ENV=production`
   - `BEH4VIOR_PUBLIC_ORIGIN=https://beh4vior.takatak.ca`
   - `TAKATAK_BEH4VIOR_LAUNCH_URL=https://takatak.ca/api/experiences/beh4vior/launch`
   - `TAKATAK_BEH4VIOR_EXCHANGE_URL=https://takatak.ca/api/experiences/beh4vior/exchange`
   - `TAKATAK_BEH4VIOR_SERVICE_TOKEN` (unique 32+ random chars, set identically in V1)
   - `BEH4VIOR_SESSION_SECRET` (different random 32+ chars)
   - `DATABASE_URL` (internal database connection string)
   - `BEH4VIOR_PILOT_MASTER_IDS` (one or more **approved adult TAKATAK master identity IDs**, comma separated). Keep missing until parental consent / privacy approval is documented. Never commit IDs to public source.
4. Add to **production TAKATAK-V1 Coolify**:
   - `TAKATAK_BEH4VIOR_URL=https://beh4vior.takatak.ca`
   - `BEH4VIOR_EXPERIENCE_CALLBACK_URL=https://beh4vior.takatak.ca/auth/callback`
   - `TAKATAK_BEH4VIOR_SERVICE_TOKEN` (same secret as BEH4VIOR)
   Redeploy V1 only after checking existing production rollout/restart settings.
5. Create DNS record `beh4vior.takatak.ca` pointing to the existing Coolify app ingress; avoid changing parent-domain DNS or MX records. Enable HTTPS with a valid certificate and ensure reverse proxy preserves HTTPS origin.
6. Verify release:
   - `GET https://beh4vior.takatak.ca/healthz` -> HTTP 200 and `{"ok":true,"signIn":"takatak-v1","storage":"postgres"}`
   - `GET https://beh4vior.takatak.ca/api/state` without session -> 401
   - no `BEH4VIOR_PILOT_MASTER_IDS` or malformed value -> `/healthz` is 503 and `/auth/start` 503
   - approved adult launches from `/dashboard/beh4vior` on TAKATAK-V1; cookie secure and limited to BEH4VIOR domain
   - second unapproved TAKATAK identity must be refused with 403; no access to child notes, saved days, names or scores
   - inspect production error logs for **statuses only**, never include request bodies, names, or tokens
   - verify two-device save/reload only after authorized adult consent, retention, backup and deletion policies are approved
7. Release backout: restore the previous container image. Never delete the Postgres volume as a deployment rollback.

## Remaining privacy prerequisites
Private pilot does not waive the approval requirements in `docs/TASK_QUEUE.md`: guardian consent, school agreement before teacher entry, privacy impact evaluation, data retention/deletion, and qualified review of child-facing wording. Publish no children's data in issues, logs, commits or screenshots. In particular, do not assume a live DNS/certificate alone makes the service approved for child data.

## Execution boundary
GitHub writes can change code and CI, but cannot provision Coolify, DNS, production Postgres or secrets without a separately connected and authorized administration tool. No such administration connection was available at time of this report. Do not claim this domain is live until direct HTTPS and end-to-end checks succeed.

Signed: GPT-6 @ ChatGPT · 2026-11-18.
