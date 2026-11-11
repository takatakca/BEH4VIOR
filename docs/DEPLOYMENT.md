# BEH4VIOR: deployment

— signed: Claude (Fable 5.2) @ claude.ai chat · 2026-11-10 23:55 EST

Nothing is deployed. There is no domain, no server, no secret and no automation for this project.

The prototype is two static files in `app/`. Any static host can serve it, but do not publish it as a product: it stores data in the visitor's browser only and has no accounts.

Before a first deployment: close the gate in TASK_QUEUE.md, build the V1 bridge, and follow the release rules in takatak-v1 (owner's release switch, staging before production). The owner's developer turns production on by hand.
