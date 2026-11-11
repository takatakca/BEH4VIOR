# BEH4VIOR

A daily behaviour tracker for young children, shared between home and school.

The school already sends home a sheet with a face for each part of the day. BEH4VIOR turns that sheet into **five good things for the next day**. Each one is worth 20%, so a child can see at a glance how the day went: five stars is 100%.

- The five are chosen from the sheet: the hard moments of the last day first, then things that went wrong earlier in the week and are now going well.
- The teacher does nothing extra. A goal is tied to a part of the day the teacher already rates, and the face for that part of the day fills the star.
- A smiley is 20%, a straight face is 10%, a sad face is 0%.

## Status

Prototype, example data only, not deployed. See [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).

## Try it

Open `app/index.html` in a browser (or serve the `app/` folder with any static server). Data is saved in that browser only.

## Layout

| Path | What it is |
| --- | --- |
| `app/index.html` | The tracker: The five, School sheet, Days |
| `app/storage-local.js` | Storage adapter for the prototype (this device only, invented example data) |
| `docs/` | Status, task queue, handoff, deployment, decisions, TAKATAK-V1 bridge |
| `WORKLOG.md` | One line per piece of work, newest first |

## TAKATAK-V1

[TAKATAK-V1](https://github.com/takatakca/takatak-v1) stays the single master dashboard for sign-in, identity, subscriptions and billing. BEH4VIOR is a separate experience that V1 launches, the same way it launches Academy. The contract is in [docs/TAKATAK_V1_BRIDGE.md](docs/TAKATAK_V1_BRIDGE.md). It is planned, not built.

## Privacy rule

This repository is public. Never commit a real child's name, a real school report, a photo of a sheet, or a teacher's name. Examples in code and docs are invented.
