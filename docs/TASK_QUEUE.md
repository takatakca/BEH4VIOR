# BEH4VIOR: task queue

Newest decisions from the owner go first. — signed: Claude (Fable 5.2) @ claude.ai chat · 2026-11-11 00:40 EST

## Owner order 2026-11-18: 3-goal follow-up worksheet and catch-up celebration
Add an **optional** three-goal daily worksheet mode for speaking about feelings, listening to an answer, and waiting a turn to respond. Use sad / neutral / happy choices for all three. Every goal is approximately one-third of 100 points (34+33+33 with proportional half-credit); do not convert or rescore the existing 4-goal 10+30+30+30 records. The owner may assign retrospective achievement scores, but **never label them as verified teacher scores** unless the teacher actually confirmed those scores. All named children, school reports, signed papers, and personalized printable packets stay outside this public repository; a copy was put in a restricted private Drive folder.

Next: persist the optional goal style with the parent's authenticated daily record only after consent/privacy review and ensure historic goal modes round-trip correctly. Continue real printer QA and physical four-fold testing.

## Owner order 2026-11-14: grow a little every week

Start with a real printable four-fold child challenge worksheet, then make small tested additions weekly rather than rewriting the whole product. The worksheet design established by the owner is **four goals totaling 100 points**: one 10-point binary feelings/reflection goal, and three 30-point behavior goals, three selectable sad/neutral/happy faces for the large goals, black N/A over the neutral choice for the binary goal, a motivation note, prior-day score, and one traceable first name.

**Current branch:** isolated browser-local printable editor, no backend integration, no private child data in GitHub.
**Next priorities, in order:** (1) verify portrait print/folding physically and on a phone, (2) get the existing TAKATAK sign-in + deployment live after privacy/consent gates, (3) reconcile the old 5×20 tracker with optional 4-goal weight presets and server persistence, (4) parent-controlled review before teacher sharing, (5) opt-in French/English localization and data export/delete UI, (6) later photo-to-face confirmation, not automatic scoring.

**Release requirement:** don't call it production/100% without printed-sheet QA, authentication + account isolation tests, privacy review and a real two-device smoke test. Keep goals positive and educational; the teacher decides recess eligibility.

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
