# BEH4VIOR: agent handoff

## Repository and baseline
takatakca/BEH4VIOR. main 0741b8a holds the first static prototype. Branch `claude/node-launch` (PR open) holds the Node.js server and the V1 sign-in handoff. Re-query main and open PRs before every push.

## Last completed task
Owner order 2026-11-10 23:47 EST: make it launch-ready for `beh4vior.takatak.ca` with sign-in through V1. Done as code on both sides: this repository's PR, and takatak-v1 PR #285 (routes, dashboard entry, env names, bridge doc, work log line). Board: CLAIM and DONE on foodhubca issue 105. Drive: journal notes in the owner's journal folder.

## Files
`server.js`, `lib/storage.js`, `lib/validate.js`, `test/server.test.js`, `app/index.html`, `app/app.js`, `app/storage-server.js`, `app/storage-local.js`, `Dockerfile`, `.env.example`, `package.json`, `docs/*.md`.

## Verification performed
See "Verified" and "Not verified" in PROJECT_STATUS.md. The honest summary: both sides pass their local checks; the two have never been run against each other.

## Known gaps
Not deployed. English only. One adult account per family, no sharing. No button for deleting data. The owner's first two sheets live only in his private claude.ai page and must be re-entered on the live site.

## Exact next action
The owner's developer follows DEPLOYMENT.md (merge V1 PR #285, token, DNS, Coolify app and Postgres, variables, smoke test). An agent without Coolify and DNS access cannot do this step. Meanwhile the safe next coding task is French and English strings in `app/app.js` and `app/index.html`.

## Restart model
No schedule and no autonomous agent was created by this work.

— signed: Claude (Fable 5.2) @ claude.ai chat · 2026-11-11 00:40 EST
