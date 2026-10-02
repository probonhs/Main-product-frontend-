# Frontend loop state

Updated 2 October 2026. Current authority: `docs/START_HERE.md` and the five-phase loop prompt.

- Product repository: `probonhs/Main-product-frontend-`; review branch: `codex/frontend-handoff`.
- Current work: organization preserved; GitHub push rejected; bounded Phase 1 compatibility work implemented.
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
- Git: four earlier local commits follow product `b84c910`; implementation preserved in `fc47985`.
  Organization/prompt records committed in `fc47616`; working tree was clean after that commit.
  Push to `codex/frontend-handoff` was REJECTED: OAuth token lacks workflow scope for the existing CI file.
  Publish only to `probonhs`; never to the public website's `origin`.
- Access: GitHub authentication works; current CLI token has repo/read:org/gist, not workflow scope.
  No remote branch/PR created. User action: `gh auth refresh -h github.com -s workflow`, then retry the normal
  product push. Do not drop workflow history or work around the authorization restriction.
- Runtime: development server was running on 127.0.0.1:3300. Check before starting another process.
- Review status: NEEDS_VERIFICATION, not pilot GO. Founder authorizes safe WIP checkpoint commits.
- Ownership: founder builds frontend; teammate supplies local backend setup/contract clarification/narrow fixes.
- Founder-only choices: identity/session approach, data processing, retention, pilot scope and release.
- Next move: connect approved synthetic setup and complete source/role/persistence and Brave acceptance.
  Q-008 needs narrow backend message-scoped source lookup. Production identity remains a founder choice.
  Preserve the UI, source guard and local checkpoints; do not repeat the old council or unchanged push failure.

Detailed evidence: ASK_CONVERSATION_SLICE.md, PHASE_1_COMPATIBILITY.md, VERIFY_handoff-2026-10-02.md,
and `docs/product/FEATURE_API_GAPS.md`.
