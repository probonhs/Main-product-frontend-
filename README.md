# Placedon — product frontend

Founder-owned frontend development repository: **probonhs/Main-product-frontend-**.
This checkout preserves the inherited public website, brand kit and design history; product development
does not deploy the public website.

Start with [docs/START_HERE.md](docs/START_HERE.md). It identifies built work, open gates, repositories,
approved design, exact continuation steps and historical documents.

| Need | Read |
|---|---|
| Current status / next action | [State](docs/frontend-loop/STATE.md), [handoff](docs/frontend-loop/HANDOFF.md) |
| Appearance | [Selected design and comparison](docs/design/README.md) |
| Features, APIs and missing integration | [Feature/API gap map](docs/product/FEATURE_API_GAPS.md), [input inventory](docs/product/API_INPUT_INVENTORY.json) |
| Your five-phase development loop | [Copy-ready loop prompt](docs/FIVE_PHASE_FRONTEND_LOOP_PROMPT.md) |
| Team responsibilities / message | [Team handoff](docs/product/TEAM_HANDOFF.md) |
| Required product semantics | [Product brief](docs/FINAL_FRONTEND_DEVELOPMENT_PROMPT.md), [AGENTS.md](AGENTS.md) |
| Detailed review automation | [Review policy](docs/FRONTEND_MULTI_AGENT_LOOP_PROMPT.md), [runner](docs/frontend-loop/RUNNER.md) |

## Run locally

Node 22, Next.js 16 / React 19 / strict TypeScript. Use the committed lockfile.

```bash
npm ci
npm run dev
# http://127.0.0.1:3300/workspace
```

Independent checks and captured examples work without a v2 gateway. Saved conversations need approved
local gateway configuration and a compatible store; they have no fake fallback. See `.env.example`.
Gateway credentials stay server-side. Production login and connected acceptance are not complete.

## Verify

```bash
npm run typecheck
npm run lint
npm run test:contracts
npm run loop:validate
npm run test:loop
npm run build -- --webpack
npm run performance:budget
```

Webpack is the documented local fallback after a stalled Turbopack build. Browser/CI/practitioner acceptance
are separate gates. A green build does not mean pilot-ready.

## Git and review

Product changes belong on a review branch in `probonhs/Main-product-frontend-`, never this checkout's website
`origin`. The agent can automatically commit safe READY or explicitly WIP checkpoints; the founder has the
final approval. No automatic merge, deployment or force-push. Secrets/client files are excluded from Git.

Original marketing deployment instructions are preserved in [the historical README](docs/history/README_2026-09-26.md).
They are not the product deployment plan.
