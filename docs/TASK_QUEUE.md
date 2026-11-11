# BEH4VIOR: task queue

Newest decisions from the owner go first. — signed: Claude (Fable 5.2) @ claude.ai chat · 2026-11-11 00:40 EST

## Owner order 2026-11-11 00:08 EST

Get it running for his son tomorrow or the day after, then build slowly from real use. Do not spend on big builds. The long-term plan (games with daily limits, courses, subscription, parent controls, schools) is recorded in ROADMAP.md and is not started.

## Owner order 2026-11-10 23:47 EST

Concentrate on a version that can be tested online at `beh4vior.takatak.ca`, signed in through TAKATAK-V1, for the owner's personal use first. Games come after. Code is ready (this repository + takatak-v1 PR #285); the deployment steps in DEPLOYMENT.md are waiting on the owner's developer.

## Owner decisions needed

1. **Scoring.** A straight face counts 10% today (half a star). Keep, or make it all or nothing?
2. **How many catch-up goals.** A bad day can make all five goals catch-up goals. Cap it (for example three catch-up, two keep-it-up) so a child always has goals he can win?
3. **Who fills the faces.** Parent copies the paper sheet at night (works today), or the teacher taps them (needs accounts and the school's agreement).
4. **First school.** Which school or class tries it first, and who there agrees to it.

## Next, in order

0. Deploy for the private test (DEPLOYMENT.md), then the owner re-enters his first sheets on the live site.

1. French and English on every screen (Quebec market; the sheet itself mixes both).
2. Roles and sharing: parent, teacher, read-only family member. Depends on the V1 bridge.
3. V1 bridge: launch and exchange routes in V1, session and storage adapter here (TAKATAK_V1_BRIDGE.md).
4. Server storage behind the adapter in `app/storage-local.js`.
5. Printable take-home card of the five, with space to colour.
6. Photo of the paper sheet → faces filled in for the parent to confirm. Never automatic: a wrong face changes a child's score.
7. Parent and teacher messages attached to a day.
8. Colouring page and games. Owner's ideas, 2026-11-10:
   - Games stay available after a bad day, in a separate side of the app, but that side is educational: finger-tracing letters (B, C, D…).
   - Each age group gets its own set of the same kinds of games. The first child is five.
   - A counting game: fish fall from the sky worth +1, +2, +3, +4; tap them to add up to exactly 20. Going over 20 loses and restarts.
   - Later: puzzles and matching.
   - Open question for the owner: do the fun games unlock by score, or are they always open with stars as the only score?

## Gate before any real child's data leaves a parent's own device

Owner sign-off required on each line:

- Written consent from the parent, and agreement from the school or school service centre before a teacher enters anything.
- Quebec Law 25: privacy officer named, privacy impact assessment for a product holding minors' behaviour records, data kept in Canada where possible, a deletion path that really deletes.
- No advertising, no analytics that leave the product, no child data used to train anything.
- Wording reviewed with a person qualified in early-childhood or special education: the product reports on a child's day, it does not diagnose and does not replace the school's own plan.
- A legal review. The notes above are a checklist from a developer, not legal advice.
