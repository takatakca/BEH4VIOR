# BEH4VIOR: decisions

— signed: Claude (Fable 5.2) @ claude.ai chat · 2026-11-10 23:55 EST

## 2026-11-10

1. **The goals ride on the sheet the teacher already fills.** In the first paper trial a separate "five good things" booklet was sent to school. The teacher's feedback was that it added a second thing to fill in, and that the child asked to be credited for things already expected of him. She asked to keep one tool: her sheet with the faces. So a goal is always tied to a part of the day on that sheet, and that part's face is the goal's score. No second form for the teacher.
2. **Five goals, 20% each** (owner's design). Smiley 20, straight face 10, sad face or not rated 0. The 10 is a proposal, open in TASK_QUEUE.md.
3. **How the five are picked.** From the latest sheet: hard-time parts first, then needed-reminders parts. Then parts that went wrong on earlier days of the same week and are no longer a problem, as keep-it-up goals. Then parts that went well. First five win.
4. **"Did not get it" is not a behaviour.** A recess lost as a consequence is recorded but never becomes a goal by itself; the goal comes from the part of the day where the problem happened.
5. **Goal wording is written for a five-year-old and says what to do**, not what to stop: "Gentle hands. I wait for my turn." A parent can retype any goal.
6. **Storage sits behind one adapter** (`window.BEH4VIOR_STORE`) so the page does not change when V1 sign-in and a server arrive.
7. **V1 owns identity and billing.** BEH4VIOR follows the Academy bridge pattern and adds no login of its own.
8. **No real child data in this public repository**, ever.

## 2026-11-11

9. **A small Node.js server, no framework.** One page, five API routes and a sign-in handoff do not need Next.js. One dependency (`pg`). It fits V1 through the HTTP bridge, not through a shared framework. Revisit when roles, messages or games need real routing.
10. **Session lasts up to 12 hours**, set by V1's exchange. When it ends the page sends the parent back through V1, which is silent if they are still signed in there. A deactivated V1 account loses access within 12 hours.
11. **Any V1 account gets its own empty space.** No allow-list for the private test: accounts are isolated, and an allow-list would be one more secret to manage. Revisit before the address is public.
12. **The page script moved out of the HTML** (`app/app.js`) so the server can send a strict Content-Security-Policy with no inline script.
13. **Browser input is cleaned on the server** (`lib/validate.js`): known parts of the day and faces only, length limits, five goals at most. Unknown fields are dropped.
14. **A delete path exists from day one**: `DELETE /api/everything` removes every row of the signed-in account. No button for it yet.

— signed: Claude (Fable 5.2) @ claude.ai chat · 2026-11-11 00:40 EST
