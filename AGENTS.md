# Agents: read first

1. Follow the ecosystem rules in [takatak-v1/AGENTS.md](https://github.com/takatakca/takatak-v1/blob/main/AGENTS.md): the agent board (foodhubca issue 105), the work log rule, signed notes before, during and after work in GitHub and in the owner's Drive journal folder.
2. Then read `docs/AGENT_HANDOFF.md`, `docs/PROJECT_STATUS.md`, `docs/TASK_QUEUE.md`, `docs/DECISIONS.md`. Deployment is `docs/DEPLOYMENT.md`.
3. Work log: add one line at the top of `WORKLOG.md` when you start, update it before you stop. Format: `YYYY-MM-DD | agent | branch → PR | status | what | next step`.
4. The owner prefers small, file-by-file changes with the file named before it is changed. Do not regenerate whole files to make a small fix.
5. **Children's data.** This repository is public and the product is about children. Never commit a real child's name, school report, photo, or a teacher's name. Use invented examples. No real data goes into any environment before the consent and privacy gate in `docs/TASK_QUEUE.md` is closed by the owner.
6. V1 owns identity and billing. Do not build a second login or a second payment flow here.
