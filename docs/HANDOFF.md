# Placedon — handoff (state as of 26 Sep 2026)

Paste or upload this file to continue the work in another assistant.

## What Placedon is
An evidence-first compliance product for Indian corporate law (Companies Act, 2013). Every answer
names the section, the notification (instrument) that set its wording, and the date it took effect.
When it cannot prove something it abstains ("can't tell") and names what is missing. The backend
engine is deterministic Python; no language model decides anything. Pre-launch; no practitioner has
reviewed output yet.

## Folders in ~/Desktop/Placedon-workspace
| Path | What it is |
|---|---|
| `website/` | Link to `~/placedon-claude-legal-3300`, the Next.js 16 / React 19 / Tailwind v4 site (placedon.com on Vercel). Read its `AGENTS.md` first: binding brand, voice and accessibility rules. |
| `backend/` | Clone of github.com/bubblebee1408/placedon-law-backend. Engine, 8 API routes (`checker/api.py`), 15 duties (`checker/obligations.py`), Ask contract (`checker/ask_contract.py`), plans in `docs/` (PLAN_13 = Ask screen spec, PLAN_17 = beta app screens, plan19 = workbench). Needs Python 3.10+. |
| `business-plan/` | Clone of github.com/placedon007-prog/Placedon-law-business-plan. Business plan, UX spec, interviews, design system. |
| `mockups/` | Three interactive UI mockups (.dc.html design-canvas files): `Main` = A Workspace, `Sentence` = B The Sentence, `Guided` = C Guided. Also published privately at https://claude.ai/artifact/JBgeFW8Y1sH4ggjcCoZpLj |
| `reports/FINAL_DECISION_FRONTEND.md` | 26-agent council review of the mockups and the final agreement. `.record.json` = every agent's raw output. |
| `tools/screenshot.mjs` | Headless Brave screenshot script: `node screenshot.mjs <url> <width> "<css selector>" out.png` |

## Local setup
- Node 22 in `~/.local/node/bin`, GitHub CLI in `~/.local/bin` (both on PATH via `~/.zshrc`).
- Run the site: `cd ~/placedon-claude-legal-3300 && npm run dev` → http://localhost:3300
- Checks: `npx tsc --noEmit && npx eslint . && node tests/contracts.mjs && npm run build`

## Website: committed locally, NOT pushed
Branch `site/footer-icons-features-council` (4 commits on top of `main`, author Placedon <placedon007@gmail.com>):
1. Footer: official X/LinkedIn/Instagram icons beside each handle.
2. Homepage: six detailed features (Research, Compliance, Document check, Monitoring, Drafting,
   Abstention); G.S.R. 880(E) copy corrected (880(E) replaced 700(E) from 2025-12-01 and is held
   corroborated against the e-Gazette).
3. Council report added under `docs/council/`.
4. Report renamed `docs/council/FINAL_DECISION_FRONTEND.md`.

**To push:** GitHub account `probonhs` is logged in but has read-only access. Either the
`placedon007-prog` account invites probonhs with Write access, or log in as placedon007-prog
(`gh auth login --web`), then: `git push -u origin site/footer-icons-features-council` and open a PR.
Vercel deploys `main` to placedon.com on every push, so merge only when ready. The repos are public.

## The final agreement (council, 10/10 votes): "A-shell, engine-true docket"
- **Structure from A:** duties list + detail panel, Ask with a Sources column, date-first attention home;
  home becomes a multi-company docket.
- **From B:** currency-strip timeline with ₹ figures, one gold "you are here" marker; as-of date control
  only where the engine covers it. The decision is now recorded in
  `docs/decisions/DATE_AND_LEGAL_LANGUAGE.md`: today is the default, and
  **Check an earlier date** is contextual, bounded and server-authorised.
- **From C:** plain language, glossary drawer (closed by default), "How we got this" trail from real
  response fields only.
- **Cut from pilot:** Drafts, OFAC/IBBI watch, file upload, B's sentence UI, C's wizard.
- **Non-negotiables:** all sample states recorded from real engine output; no "Met"/"Answered" unless the
  engine returns it; one status component set keyed to backend enums; every "can't tell" says whose move
  it is; no legal date maths in the frontend; 360px + Word-pane layouts; every output carries as-of date
  and law version.

## Known errors in the mockups (fix before reuse)
- They call G.S.R. 880(E) "not yet checked"; it is corroborated.
- s.173(1)/s.149(1) shown "Met" and the AGM question shown "Answered"; the engine cannot return those here.
- Quote for s.96(1) uses the opening words, not the operative proviso.

## Open decisions for the founder
1. Buyer: practising Company Secretary with many clients, or in-house legal team.
2. Official design system: the website's tokens or the business plan's.
3. Primary surface: Word task pane or web app.
4. Implement historical-coverage metadata in the backend before enabling the
   agreed **Check an earlier date** control.
5. One public sentence on AI use (API contract says no model; business plan measures ₹2.91/answer on Sonnet).
6. The site's `AGENTS.md` is stale: it says 6 routes and that `/v1/ask` does not exist; there are 8.

## Next step
Next mockup round built from real engine output (portfolio home, company attention list, Ask in all
three states, Duties), at 1440px, 360px and Word-pane widths.
