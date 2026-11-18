# BEH4VIOR

A daily behaviour tracker for young children, shared between home and school.

The school already sends home a sheet with a face for each part of the day. BEH4VIOR turns that sheet into **five good things for the next day**. Each one is worth 20%, so a child can see at a glance how the day went: five stars is 100%.

- The five are chosen from the sheet: the hard moments of the last day first, then things that went wrong earlier in the week and are now going well.
- The teacher does nothing extra. A goal is tied to a part of the day the teacher already rates, and the face for that part of the day fills the star.
- A smiley is 20%, a straight face is 10%, a sad face is 0%.

## Optional three-goal talking / listening challenge

The standalone local-only print card at `/foldable` now offers a **Daily goals** selector. The existing four-goal 10/30/30/30 version is preserved. The optional **three-goal** version focuses on speaking about feelings, listening to a reply and waiting a turn to speak, with sad/neutral/happy choices on every row. Each of three goals has roughly one-third of a 100-point maximum (weights 34+33+33, fractional half-credit rounded for the final total). The selection is saved **only in that day's local browser record** and does not modify any authenticated family data in the five-goal server tracker. Switching types prompts before replacing that day's goals and ratings.

A preview of the three-goal mode on an unsaved day can be opened at `/foldable?mode=three`; the offline HTML supports the same query. Children’s names and teacher reports are intentionally not included in this public repository. Parent-entered historical scores are never misrepresented as school-verification.

## Four-fold worksheet maker (first weekly increment)

Open **/foldable** (or **Print card** from the daily tracker). This is a separate printable-card editor: four equal portrait-letter panels; 4 editable goals; a 10-point Yes/No reflection question plus three 30-point goals; sad / straight / happy scoring faces; previous score; motivational note; and one dotted pen-stroke first-name tracing line. The teacher's assessment stays final. The child's scores and name in this editor use browser localStorage only and **do not upload or sync**. Browser storage is not encrypted and is visible to other people using the same browser profile; avoid entering real child information before the privacy/consent gate is closed. Use a trusted device; Clear this day's saved worksheet removes the selected day from that browser. Printing is local.

The pre-existing **The five** tracker remains 5 × 20 points and its school-sheet storage / TAKATAK sign-in are unchanged. The card is a small standalone V1 experiment, **not** a replacement for that logic or the production launch. GitHub CI verifies one printed letter-size page using headless Chrome; a physical fold and Android print still need owner QA. Do not enter real child data in GitHub, logs or demo fixtures.

## Status

Launch-ready code for a private test at `beh4vior.takatak.ca`, signed in through TAKATAK-V1. Not deployed yet. See [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Use the four-fold worksheet without a server

For a no-login, no-network printable copy, run `npm run build:offline` (or download the `beh4vior-offline-app` ZIP from the GitHub Actions run for this release). Open `dist/BEH4VIOR-Fourfold-Offline.html` in a browser and choose Print. No separate account is required and the bundled page has no remote dependencies.

The copy stores data only in the browser if the browser permits local-file storage, otherwise it remains usable for editing and printing without saving. It does **not** sync with TAKATAK-V1 or the school; it is not the real multi-user app. Use a trusted device, never email a completed sheet without consent, and do not treat the generated score as the teacher's final assessment.

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
