# Frontend loop state

Updated 2 October 2026. Current authority: `docs/START_HERE.md` and the five-phase loop prompt.

- Product repository: `probonhs/Main-product-frontend-`; review branch: `codex/frontend-handoff`.
- Current work: preserve/organize/commit/push all scoped frontend work, then begin unblocked Phase 1 groundwork.
- Appearance: user selected the Starting view of the hybrid cream workspace; snapshots saved in `docs/design/`.
- Implementation: independent Ask → result → Sources; local backend-owned conversation list/send/reopen,
  citation re-verification and trace. Connected/browser/production acceptance remain incomplete.
- Backend: fixtures pinned to `9486600`; conversation adapter pinned to `127ef70`.
  Latest fetched main `889ba54` adds roles, screen contracts, worker and downloads; compatibility work pending.
- Donor: website PR #2 remains OPEN; head `8461a06`. Preserve useful contracts/extraction/review/run patterns;
  do not merge the whole branch or copy the shared-passcode identity.
- Current slice verification: typecheck, lint, offline contracts, webpack production build (27 routes) and
  bundle budget (49 chunks / 399,026 gzip bytes) re-run 2 October: PASS. See VERIFY_handoff-2026-10-02.md.
  Full responsive/keyboard/privacy and live gateway acceptance are NOT RUN, not inferred from HTML.
- Gateway: no v2 URL/key currently configured. No principal/credentials created and no paid model call made.
- Git: four earlier local commits follow product `b84c910`; implementation preserved in `fc47985`.
  Organization/prompt records are being prepared as a separate commit.
  Publish only to `probonhs`; never to the public website's `origin`.
- Access: GitHub authentication works; current CLI token has repo/read:org/gist, not workflow scope.
  Existing new CI workflow may block publication; record actual push result, never drop/bypass it.
- Runtime: development server was running on 127.0.0.1:3300. Check before starting another process.
- Review status: NEEDS_VERIFICATION, not pilot GO. Founder authorizes safe WIP checkpoint commits.
- Ownership: founder builds frontend; teammate supplies local backend setup/contract clarification/narrow fixes.
- Founder-only choices: identity/session approach, data processing, retention, pilot scope and release.
- Next unblocked move after the backup attempt: reconcile latest envelopes/roles/trace fields and add focused compatibility
  tests; preserve the approved UI. Do not restart the old council.
  Retain/report any local checkpoint if publication is blocked; continue independent safe groundwork.

Detailed evidence: ASK_CONVERSATION_SLICE.md, VERIFY_workspace-ask.md, product/FEATURE_API_GAPS.md.
