# BEH4VIOR — Vision v2: an animated app for the whole day

Owner: Pierre. Date: 2026-11-10. Written from the owner's words, 2026-11-10 23:51 EST.
Signed: SOCIO, Agent Lévesque.

Today BEH4VIOR is a prototype school behaviour tracker. This document is where it
goes next: an animated app that covers the child's whole day, turns good days into
games and screen minutes, and turns bad days into learning work that wins the day
back.

## 1. The idea in one paragraph

A child opens the app and picks what the day is about. Four activities to choose
from the menus. Every activity has its own path. When the child completes things,
the day's percentage grows, fun games open up, and good days earn real minutes
to play Roblox, watch YouTube, or play other games. When the day went badly, the
child does the long learning work instead — tracing letters, building words, page
after page — and earns the day back point by point. At the end of the day the
parent can see the score, and the AI can check the proof.

## 2. The four tracks

The first activities on the menus. Each one has its own path, its own tasks, its
own games and rewards. A child can do one track or several in a day.

1. **School tracking** — what exists today. The school sheet (a face for each
   part of the day) becomes five goals for the next day. Smiley 20%, straight
   face 10%, sad face 0%. Five stars is 100%. The teacher does nothing extra:
   a goal is tied to a part of the day the teacher already rates.
2. **House chores tracking** — the chores of the day: clean the room, tidy up,
   help at home. Each chore is a task with a clear pass/fail, and finishing
   chores earns extra points on top of the day's score.
3. **Health tracking** — the healthy habits of the day. What counts as a health
   task is decided with the owner (examples: moving, drinking water, sleep
   routine). Same pattern as the other tracks: tasks, faces, percentage.
4. **Food / nutrition plan** — the food plan of the day. Eating well, following
   the plan, trying the foods on the plan. Same pattern: tasks, percentage,
   rewards.

## 3. The day loop

1. The child (or the parent) opens the day and sees the tasks for each track.
2. Tasks are completed during the day. Some days have more tasks, some have
   fewer. Some tasks are stable, regular tasks that come back every day.
3. The day's percentage accumulates as tasks are completed and rated.
4. Completed work unlocks games. Games are the fun part of the day.
5. The percentage at the end of the day converts into screen minutes and
   rewards (see §5).
6. The parent sees the day, the score, and the proof.

## 4. Two trails

Good days and bad days do not go down the same path.

### The good-day trail — fun games

When the day is going well, the child plays to learn. Games teach numbers and
letters while they feel like play. Examples from the owner:

- **Fish from the sky.** Fish drop from the sky and the child counts them to
  20. Some fish are worth 3, some 2, some 1. The child adds and subtracts to
  reach the target number, 20 in the end. Addition, subtraction, counting —
  learning numbers by playing.
- **Numbers and ABCs.** Counting games, letter games, matching games. Same
  idea: the game is the lesson.

### The bad-day trail — the long learning work

When the day went badly, there is no shortcut. The child does the long work of
learning, page after page, and accumulates points to gain back the behaviour:

- **Tracing letters.** Trace the letter A, trace the letter B, trace the letter
  C — then the next letters, one page at a time.
- **Building words.** Put the word together: the word "ca", the word "ba",
  the word "be" — then more words, page after page.
- Every finished page adds points. The points convert the day: a bad day worked
  back, step by step, into a better score.

The two trails are the same system: good days earn through play, bad days earn
through work. Both end in points, and points end in minutes.

## 5. The rewards ladder — screen minutes

Screen time is the currency. The day's percentage converts into minutes, and
more work converts into more minutes. Example from the owner:

- Today you had a 60% day — good job, you are allowed 30 minutes of Roblox.
- Continue doing school work — another 30 minutes.
- Continue doing your chores, clean your room — extra points, extra minutes.

The ladder is the same on every track: finish the work, earn the minutes. The
exact numbers (how many minutes per percentage point, per track, per chore)
are an owner decision — see §10.

## 6. Screen-time control — a later integration

The app on the parent's phone controls time on the child's phone. The parent
sets the stopper: when the earned minutes run out, the games stop. The parent
can control the child's phone, and the same control can apply to time on any
phone in the family.

This is the hardest technical piece in this document and it comes later, after
the tracks and the games work. It needs a research spike first: what the phone
platforms actually allow (iOS Screen Time / Family controls, Android Digital
Wellbeing / Family Link, and what a third-party app can and cannot enforce),
and whether it needs a native app, a device profile, or a companion app on the
child's phone. No promise is made here about which approach wins — the spike
decides.

## 7. AI evaluation — the parent scans, the AI decides

The parent can scan the proof — for example, take a photo of the room after
the child cleaned it — and the AI evaluates whether it really passed the test.
The AI decides the percentage on the basis of what is presented. Nobody hands
out extra points by hand: what you present to the AI is what decides the
score.

**Gate — read this before building it.** A photo of a child's room, a child's
day, a child's behaviour record is sensitive personal data about a minor. This
feature is built only behind the consent and privacy gate already written in
`docs/TASK_QUEUE.md`: written parental consent, school agreement where a
teacher is involved, Quebec Law 25 (privacy officer named, privacy impact
assessment, data kept in Canada where possible, a deletion path that really
deletes), no advertising, no analytics that leave the product, no child data
used to train anything, wording reviewed with a person qualified in
early-childhood or special education, and a legal review. No real child's data
goes into any environment before that gate is closed by the owner.

## 8. What does not change

- **TAKATAK-V1 stays the master.** V1 owns sign-in, identity, subscriptions
  and billing. BEH4VIOR does not build a second login or a second payment
  flow. V1 launches BEH4VIOR the same way it launches Academy. The contract
  is in `docs/TAKATAK_V1_BRIDGE.md` — planned, not built.
- **The teacher does nothing extra** on the school track. A goal is tied to a
  part of the day the teacher already rates.
- **French and English on every screen.** Quebec market; the school sheet
  itself mixes both.
- **Privacy rule.** This repository is public. Never commit a real child's
  name, a real school report, a photo of a sheet, or a teacher's name.
  Examples in code and docs are invented.
- **Small steps, file by file.** The owner prefers small, file-by-file
  changes with the file named before it is changed. No whole-file rewrites
  for a small fix. Work log line at the top of `WORKLOG.md` when work starts,
  updated before it stops.

## 9. How to get it done — phases

### Phase 0 — Notes and decisions (now)

- This document. One line in `WORKLOG.md`. The open decisions in §10 go into
  `docs/TASK_QUEUE.md` as owner decisions needed.
- Nothing is built in this phase. The owner reads the notes, corrects them,
  and answers the decisions.

### Phase 1 — The four tracks

- Build the chores track, the health track and the food / nutrition track on
  the same pattern as the school track: tasks for the day, a face or a
  pass/fail per task, a percentage for the track, a share of the day's score.
- Menus: the child picks the activity from the menus; each track has its own
  path and its own screens.
- French and English on every screen, from the start of this phase.

### Phase 2 — The games

- Good-day games first: the fish counting game (count to 20, fish worth 3/2/1,
  addition and subtraction to reach the target), then numbers and ABCs games.
- Bad-day learning work: letter tracing (A, B, C, then the rest), word
  building ("ca", "ba", "be", then more), page after page, points per page.
- The games read the day's score and the track; they never invent a score.

### Phase 3 — The rewards ladder and screen-time control

- The rewards ladder: percentage → minutes, per track, with the owner's
  numbers from §10.
- Research spike on screen-time control (see §6). Then the parent app, the
  stopper, and the earned-minutes unlock for Roblox, YouTube and other games.
- This phase is the biggest one. It does not start before Phases 1 and 2 work.

### Phase 4 — AI evaluation

- Behind the consent / Law 25 gate (§7). Parent scans the proof, AI evaluates,
  AI sets the percentage. Start with one proof type (for example, the room)
  and one track (chores), then extend.
- Never automatic on a face: a wrong face changes a child's score, so the
  parent always confirms what the AI read.

### Phase 5 — V1 bridge, server, pilot

- V1 bridge: launch and exchange routes in V1, session and storage adapter
  here. Roles and sharing: parent, teacher, read-only family member.
- Server storage behind the adapter in `app/storage-local.js` (today the
  prototype only saves in one browser).
- Printable take-home card of the five, with space to colour. Parent and
  teacher messages attached to a day. Colouring page and simple games as
  rewards.
- Pilot: the first school or class, with the school's agreement — owner
  decision (§10).

## 10. Open decisions for the owner

From `docs/TASK_QUEUE.md`, still open:

1. **Scoring.** A straight face counts 10% today (half a star). Keep, or make
   it all or nothing?
2. **How many catch-up goals.** A bad day can make all five goals catch-up
   goals. Cap it (for example three catch-up, two keep-it-up) so a child
   always has goals he can win?
3. **Who fills the faces.** Parent copies the paper sheet at night (works
   today), or the teacher taps them (needs accounts and the school's
   agreement).
4. **First school.** Which school or class tries it first, and who there
   agrees to it.

New decisions from this vision:

5. **Track order.** School first (done), then which track next — chores,
   health, or food?
6. **Rewards numbers.** How many minutes per percentage point, and per track?
   Example in §5 is 60% → 30 minutes of Roblox. Keep that scale?
7. **Screen-time approach.** Parent app with a stopper on the child's phone —
   which platform first, and how strict is the stopper?
8. **AI evaluation scope.** Which proof first (the room? the sheet?), and
   which track first (chores?)?
9. **Games order.** Fish counting first, or letter tracing first?

## 11. What "done" looks like

- A child can pick a track from the menu, see the day's tasks, complete them,
  watch the percentage grow, play a game, and see the minutes earned.
- A bad day has a visible way back: tracing, words, pages, points — and the
  score moves.
- A parent can see the day, scan the proof, and trust that the score came
  from what was presented, not from hand-outs.
- Nothing about a real child lives in this public repository, and nothing
  about a real child leaves a parent's device before the consent gate closes.
