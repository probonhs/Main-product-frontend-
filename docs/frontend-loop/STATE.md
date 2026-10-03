# Frontend loop state

Updated 3 October 2026. Current authority: `docs/START_HERE.md` and the five-phase loop prompt.

- Product repository: `probonhs/Main-product-frontend-`; review branch: `codex/frontend-handoff`.
- Execution: PAUSED at the user's request after this checkpoint; do not continue until the user resumes.
- Current work: user selected Phase 1. Keyboard navigation and stable independent-Ask Sources layout
  implemented; engineering gates passed. Full Brave and connected acceptance remain pending.
- Appearance: user selected the Starting view of the hybrid cream workspace; snapshots saved in `docs/design/`.
- Implementation: independent Ask → result → Sources; local backend-owned conversation list/send/reopen,
  citation re-verification and trace. Connected/browser/production acceptance remain incomplete.
- Backend: fixtures pinned to `9486600`; conversation adapter pinned to `127ef70`.
  Latest fetched main `889ba54` inspected for roles/trace/source contracts. Guarded Phase 1 changes are built;
  connected acceptance remains pending. Source lookup collision requires Q-008; uploads remain gated.
- Donor: website PR #2 remains OPEN; head `8461a06`. Preserve useful contracts/extraction/review/run patterns;
  do not merge the whole branch or copy the shared-passcode identity.
- Current slice verification: typecheck, lint, offline contracts, webpack production build (27 routes) and
  bundle budget after Phase 1 (49 chunks / 399,238 gzip bytes), full contracts/loop checks and webpack build:
  PASS. See PHASE_1_COMPATIBILITY.md and VERIFY_handoff-2026-10-02.md.
  Full responsive/keyboard/privacy and live gateway acceptance are NOT RUN, not inferred from HTML.
- Gateway: no v2 URL/key currently configured. No principal/credentials created and no paid model call made.
- Git: `9c2024e` and its predecessor work are published on `probonhs/codex/frontend-handoff`; remote SHA
  was verified. Workflow scope was authorized by the user; the earlier push blocker is resolved.
  No PR/merge/deployment created. Publish only to `probonhs`, never the website's `origin`.
  This Phase 1 checkpoint follows that baseline; inspect Git for the current HEAD/publication state.
- Runtime: development server was running on 127.0.0.1:3300. Check before starting another process.
- Review status: NEEDS_VERIFICATION, not pilot GO. Founder authorizes safe WIP checkpoint commits.
- Ownership: founder builds frontend; teammate supplies local backend setup/contract clarification/narrow fixes.
- Founder-only choices: identity/session approach, data processing, retention, pilot scope and release.
- Next move: complete Phase 1 Brave keyboard/reflow/Sources checks when browser control is available,
  then connect approved synthetic setup for source/role/persistence acceptance.
  Q-008 needs narrow backend message-scoped source lookup. Production identity remains a founder choice.
  Preserve the UI, source guard and local checkpoints; do not repeat the old council or unchanged push failure.

Detailed evidence: PHASE_1_SHELL_ACCEPTANCE.md, ASK_CONVERSATION_SLICE.md, PHASE_1_COMPATIBILITY.md, VERIFY_handoff-2026-10-02.md,
and `docs/product/FEATURE_API_GAPS.md`.
