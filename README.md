# Placedon — product frontend

Founder-owned frontend development repository: **probonhs/Main-product-frontend-**.
This checkout preserves the inherited public website, brand kit and design history; product development
does not deploy the public website.

Start with [docs/START_HERE.md](docs/START_HERE.md). It identifies built work, open gates, repositories,
approved design, exact continuation steps and historical documents.

> **Where things stand (2026-10-08):** the `/app` console has been redesigned as the
> Split workspace. What is complete, what is waiting on the owner, and what comes next is
> in [`docs/STATUS.md`](docs/STATUS.md); the console's design system is in AGENTS.md →
> "/app console".

Placedon is an evidence-first legal-intelligence product for **Indian corporate
law (Companies Act, 2013)**. Voice: *"a witness, not a tool."* Golden rule:
*"the model explains, the code decides, the record verifies."* Every answer
carries its provision, amending instrument, and operative date — or it abstains.

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
# http://127.0.0.1:3300/app
npm run build
npm run typecheck && npm run lint && npm test
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

## Architecture (why this matters for backend work)
- **Frontend (this repo)** → Vercel. Marketing site **plus** the `/app` console for in-house lawyers.
- **Backend (separate repo, `placedon-law-backend`)** → the deterministic engine, the gateway, the
  job worker and the model gateway.
- **Two backend surfaces, two clients in this repo** (full contract in `AGENTS.md`):
  - `/v1` engine, unauthenticated → `src/lib/engine/*`, selected by `PLACEDON_API_ORIGIN`
    (unset → Mock engine with real Companies-Act fixtures). Used by the `/product/*` surfaces.
  - `/v2` gateway verbs, API-key authenticated → `src/lib/gateway/*`, selected by `GATEWAY_URL`
    + `PLACEDON_GATEWAY_KEY` (unset → MockGateway; URL set without a key → throws on purpose).
    Used by the `/app` console.
- **Both clients are server-only.** Never import either into a `"use client"` module — the token
  would be inlined into the public bundle; `server-guard` throws rather than let it.
- **A transport error must NEVER render as an abstention** (`EngineResult<T>` / `AskState`
  enforce it). `cost_inr: null` is UNPRICED, never 0. There is no list-runs verb.
- Run the real gateway locally: `python3 scripts/local-gateway.py` → see `docs/RUN_LOCALLY.md`.

## Where things live
```
src/
├── app/                     Next.js App Router
│   ├── page.tsx               home
│   ├── product/ how-it-works/ pricing/ about/ security/ faq/   marketing pages
│   ├── product/{compliance-pack,document-check,events,instruments}/  live /v1 surfaces
│   ├── app/                   the /app console (passcode login)
│   │   ├── page.tsx + ask-console.tsx     Ask
│   │   ├── contracts/                     playbook review
│   │   ├── documents/                     document review
│   │   ├── runs/ + runs/[id]/             runs started in this browser + trace
│   │   ├── review-gate.tsx                lawyer approve / reject
│   │   ├── actions.ts                     Server Actions — the only path to the gateway
│   │   └── login/                         passcode → signed session cookie
│   ├── api/waitlist/route.ts  pilot-request form sink
│   ├── privacy/ terms/ cookies/            legal pages (templates for counsel review)
│   ├── og/ robots.ts sitemap.ts            SEO
│   └── layout.tsx globals.css             fonts, tokens, chrome
├── components/              shared UI (site-chrome, sections, evidence-card, request-form, surfaces/)
└── lib/
    ├── engine/                /v1 client: types, Mock + Http providers, errors, server-guard
    ├── gateway/               /v2 client: types, Mock + Http providers
    ├── auth/                  console session, token, recent-runs (this browser only)
    ├── documents/             .pdf / .docx / .zip text extraction for uploads
    ├── placedon-content/      ALL marketing copy + legal templates (edit here, not in components)
    ├── tokens.ts              design tokens — no hex in components
    └── format.ts seo.ts site.ts track.ts legal.ts intake.ts
tests/                       node:test suites (gateway, documents) + contracts.mjs + browser.mjs
scripts/local-gateway.py     starts the real backend gateway and writes a key into .env.local
brand-kit/                   logo, colours, self-hosted fonts (Fraunces, IBM Plex Mono, Inter), posters
public/                      served assets (brand mark, hero media)
docs/                        see docs/README.md
```

Webpack is the documented local fallback after a stalled Turbopack build. Browser/CI/practitioner acceptance
are separate gates. A green build does not mean pilot-ready.

## Git and review

Product changes belong on a review branch in `probonhs/Main-product-frontend-`, never this checkout's website
`origin`. The agent can automatically commit safe READY or explicitly WIP checkpoints; the founder has the
final approval. No automatic merge, deployment or force-push. Secrets/client files are excluded from Git.

Original marketing deployment instructions are preserved in [the historical README](docs/history/README_2026-09-26.md).
They are not the product deployment plan.

## ⚠️ CRITICAL gotchas (save yourself hours)
1. **Git author email must be valid** or Vercel silently BLOCKS the deploy.
   Set it before committing: `git config user.email "placedon007@gmail.com"`.
   (A `…@Macbook.local` author = Blocked deploy, site serves the old build.)
2. **You cannot push `.github/workflows/*`** with the current token (no
   `workflow` OAuth scope). Use Vercel's auto-deploy or Azure Deployment Center
   instead — do not add CI workflow files to the repo.
3. **Verify with `npm run build` + a real browser, NOT curl.** Curl-based
   fetching of the deployed JS chunks is unreliable in this environment and gives
   false negatives. Trust the Vercel dashboard + browser DevTools.
4. **Brave (and ad-blockers) block Google Analytics.** When testing GA, use
   Chrome with extensions off, check GA **Realtime** (not the lagging Home page),
   and look for a `google-analytics.com/g/collect` request in DevTools → Network.
5. **AGENTS.md is binding** (re-read it every session): near-monochrome brand +
   one gold accent; reader-facing **Section 96** in bold serif, its evidence line (`s.96(1)`, figures, instruments, dates) in IBM Plex Mono; **banned
   words** (streamline, empower, solution/Solutions, seamless, easy, smart,
   revolutionary, unlock, supercharge, effortless, game-changer, cutting-edge,
   "Join the waitlist"); never invent a statutory figure/section/date (abstain);
   never claim an accuracy rate; a11y AA; respect prefers-reduced-motion.
6. **India-first**: ₹ lakh/crore, MCA21/ROC/Gazette/CIN, DPDP Act 2023,
   ICSI/ICAI, IST timestamps, Indian number grouping (`src/lib/format.ts`).

## What's left / next steps
1. **Legal review** of the templates by a real lawyer → then set `SITE_ORIGIN`
   + `SITE_PUBLICATION_READY=true` (Vercel env) to allow Google indexing.
2. **Backend**: train the narration/description model + host the engine on a
   credit-backed cloud; then set `PLACEDON_API_ORIGIN` so product surfaces go
   live instead of mock.
3. **GA**: mark `generate_lead` as a key event (GA Admin → Events).
4. Optional: make `placedon.com` (non-www) the primary in Vercel → Domains;
   grade/replace the white hero video below the fold.

## Reference docs
- `AGENTS.md` — binding brand/voice/engineering rules (authoritative).
- `docs/README.md` — index of every document.
- `docs/RUN_LOCALLY.md` — run the console against the real gateway.
- `docs/deploy/VERCEL.md`, `docs/deploy/AZURE.md` — deployment guides.
- `docs/app-screens/` — live screenshots of the console, and how the live system differed from the mock.
- `docs/archive/` — earlier prompts, RAG notes and redesign dossiers (history, not instructions).
