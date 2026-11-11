# BEH4VIOR / TAKATAK-V1 bridge (built on both sides, not deployed, never run against the real V1)

— signed: Claude (Fable 5.2) @ claude.ai chat · 2026-11-10 23:55 EST

Counterpart note in V1: `docs/BEH4VIOR_BRIDGE.md` in https://github.com/takatakca/takatak-v1

TAKATAK-V1 remains the single master dashboard for sign-in, identity, subscriptions, entitlements and billing. BEH4VIOR is a separately deployed experience. It never owns customer identity and never takes a payment. This mirrors the Academy bridge already in V1 (`docs/TAKATAK_ACADEMY_BRIDGE.md`, routes under `src/app/api/experiences/academy/`).

## Routes in V1 (takatak-v1 PR #285)

- `/dashboard/beh4vior`: dashboard entry. Opens BEH4VIOR's `/auth/start` using `TAKATAK_BEH4VIOR_URL`; shows a truthful "not configured" state when missing.
- `GET /api/experiences/beh4vior/launch?state=<43-character base64url>`: TAKATAK login (with `next` preserved), profile sync, active master identity check, 90-second one-time launch code hashed in `ExperienceLaunchCode`, redirect to the configured callback.
- `POST /api/experiences/beh4vior/exchange`: bearer-secret protected, one-time atomic consumption, identity re-check. Returns `{ok:true,session:{masterIdentityId,displayName,productCode:"beh4vior",entitlements:["beh4vior_free"],expiresAt}}`.

No V1 migration is expected: `ExperienceLaunchCode` already exists. Free access only until a real product and price exist in V1.

## Configuration (names only, no values in any repository)

V1: `TAKATAK_BEH4VIOR_URL`, `BEH4VIOR_EXPERIENCE_CALLBACK_URL`, `TAKATAK_BEH4VIOR_SERVICE_TOKEN`.
BEH4VIOR: `TAKATAK_BEH4VIOR_LAUNCH_URL`, `TAKATAK_BEH4VIOR_EXCHANGE_URL`, `TAKATAK_BEH4VIOR_SERVICE_TOKEN` (same value), `BEH4VIOR_SESSION_SECRET`, `DATABASE_URL`.

## What stays in BEH4VIOR

Children, classes, daily sheets, goals and messages live in BEH4VIOR's own database, keyed by `masterIdentityId`. V1 receives no child data: not names, not scores, not notes. V1 knows only that an adult account may open the product.

## This side

- `GET /auth/start`: makes a 43-character state, keeps it in a short HttpOnly cookie, redirects to V1's launch URL.
- `GET /auth/callback?code&state`: checks the state against the cookie, exchanges the code server-to-server with the bearer token, checks `productCode` and `beh4vior_free`, then sets this app's own signed session cookie (12 hours at most).
- `POST /auth/logout`: clears the cookie.
- `app/storage-server.js` is the page's adapter to `/api/state`, `/api/days/:date`, `/api/child`.

## Open point for V1's owner and coordinator

Parents and teachers are different people looking at the same child. The link between them (a parent invites a teacher, or a school invites parents) is a BEH4VIOR concept. V1 workspaces may or may not be the right container for a class. Decide before building roles.
