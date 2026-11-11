# BEH4VIOR: project status

Last updated 2026-11-10. — signed: Claude (Fable 5.2) @ claude.ai chat · 2026-11-10 23:55 EST

## What exists

- `app/index.html`: one page, three views.
  - **The five**: the day's five goals, a star each, the day's percentage, a face to tap for each goal, goal wording editable in place.
  - **School sheet**: sixteen parts of the day as on the paper sheet (Morning Circuit to Special Activity), four marks each (good, needed reminders, hard time, did not get it), a note per part, "I am proud of", "Notes", and a button that builds the next school day's five.
  - **Days**: every day with its score and its faces.
- `app/storage-local.js`: prototype storage, this browser only, invented example data.
- The owner also has a private copy of the same page on claude.ai holding his own family's sheets. That data is not in this repository and must not be.

## What does not exist yet

- Accounts, roles (parent, teacher, school), sharing between a parent and a teacher.
- Any server, database or deployment.
- The TAKATAK-V1 bridge (contract only, see TAKATAK_V1_BRIDGE.md).
- French. The page is English only; teachers' notes are typed as written.
- Scanning a paper sheet, the parent and teacher chat, the colouring page, the games.

## Verified

- Script syntax of both files (`node --check`).
- The goal rule on one real week (two fixes from the latest day, three keep-it-up goals from earlier in the week).
- Not verified: no browser test run was recorded, no accessibility pass, no test with a teacher.
