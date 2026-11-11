# BEH4VIOR

A daily behaviour tracker for young children, shared between home and school.

The school already sends home a sheet with a face for each part of the day. BEH4VIOR turns that sheet into **five good things for the next day**. Each one is worth 20%, so a child can see at a glance how the day went: five stars is 100%.

- The five are chosen from the sheet: the hard moments of the last day first, then things that went wrong earlier in the week and are now going well.
- The teacher does nothing extra. A goal is tied to a part of the day the teacher already rates, and the face for that part of the day fills the star.
- A smiley is 20%, a straight face is 10%, a sad face is 0%.

## Status

Launch-ready code for a private test at `beh4vior.takatak.ca`, signed in through TAKATAK-V1. Not deployed yet. See [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Try it

Node 22.

```
npm ci
npm run demo   # invented example data, saved in the browser
npm run dev    # real server, local test account, JSON file in data/
npm test
```

Then open http://localhost:3000.

## Layout

| Path | What it is |
| --- | --- |
| `server.js`, `lib/` | Node.js server: page, JSON API, sign-in handoff with V1, Postgres storage |
| `app/index.html`, `app/app.js` | The tracker: The five, School sheet, Days |
| `app/storage-server.js` | The page's storage adapter for the real server |
| `app/storage-local.js` | Demo adapter (this device only, invented example data) |
| `test/` | Server tests |
| `Dockerfile`, `.env.example` | Deployment |
| `docs/` | Status, task queue, handoff, deployment, decisions, TAKATAK-V1 bridge |
| `WORKLOG.md` | One line per piece of work, newest first |

## TAKATAK-V1

[TAKATAK-V1](https://github.com/takatakca/takatak-v1) stays the single master dashboard for sign-in, identity, subscriptions and billing. BEH4VIOR is a separate experience that V1 launches, the same way it launches Academy. The contract is in [docs/TAKATAK_V1_BRIDGE.md](docs/TAKATAK_V1_BRIDGE.md). Both sides are written; they have not been deployed or run against each other.

## Privacy rule

This repository is public. Never commit a real child's name, a real school report, a photo of a sheet, or a teacher's name. Examples in code and docs are invented.
