# Frontend handoff — 3 October 2026

Repository: `probonhs/Main-product-frontend-`
Branch: `codex/frontend-handoff`; inspect `git log -5 --oneline` for actual HEAD before continuing.
Current entry: `docs/START_HERE.md`. Execute `docs/FIVE_PHASE_FRONTEND_LOOP_PROMPT.md`, not the full chat.
Execution is PAUSED at the user's request after this checkpoint. Resume only on a new user instruction.

Preservation commits: implementation `fc47985`, organization/prompt `fc47616`, guarded compatibility
`9c2024e` (plus four earlier commits). All published to `probonhs/codex/frontend-handoff`, with matching
remote SHA verified after user-authorized workflow permission. The earlier push failure is resolved.
No PR, merge or release. This Phase 1 checkpoint follows that baseline; inspect actual HEAD before resuming.

## Completed and preserved

Engine-pinned fixtures/client; approved assistant workspace; independent Ask and captured states;
development-only v2 conversation/citation/trace slice; saved design snapshots; feature/API inventory;
team split and copy-ready teammate request; lean five-phase loop with pre-limit safe checkpoints.

This is code preservation and offline verification, not live/pilot approval. Latest backend main `889ba54`
requires reconciliation with the conversation adapter's `127ef70` pin. A new viewer-default API principal
cannot send questions. Browser sessions/tenant/actor mapping are still open.

## Verify before claiming progress

```bash
git status --short --branch
git remote -v
npm run typecheck
npm run lint
npm run test:contracts
npm run loop:validate
npm run test:loop
npm run build -- --webpack
npm run performance:budget
```

Last slice: offline/build/budget passed; Brave full acceptance and connected v2 tests incomplete.
Turbopack stalled locally; webpack passed. Do not infer CI default build success.

## Git boundary

Automatic safe checkpoint commits/pushes are authorized on the product review branch, including honestly
labelled WIP. No automatic merge/deploy. Do not stage `.env.local`, provider config, client documents or
unrelated changes. Do not omit the existing CI workflow to bypass token scope. If push fails, retain the
commit and record its SHA/blocker. Confirm remote HEAD before saying it is published.

## Next action

User selected Phase 1. The workspace-local skip link now bypasses repeated navigation, and opening Sources
in independent Ask no longer narrows/recenters the answer. Sources stays in flow below 1800px; beyond that
it uses the right spare margin. Structural tests, TypeScript, lint, contracts, loop checks, webpack build
and unchanged 399,238-byte gzip budget pass. Local HTTP render checks pass on a captured partial answer.
Independent targeted review accepted those two fixes; full Brave control was interrupted, so focus,
screen-reader, measured reflow/contrast and wide-screen geometry remain NOT RUN. See PHASE_1_SHELL_ACCEPTANCE.md.
Editing facts still clears the previous answer: open follow-up UX item, not silently fixed with stale evidence.
Next: complete actual Brave acceptance (320/360/400/768/1024/1440/1800/1920px, keyboard, source open/return),
then approved connected synthetic setup. Do not mark Phase 1 complete or choose production identity silently.

Organization and a bounded Phase 1 move are now preserved. See PHASE_1_COMPATIBILITY.md: typed auth/error
states, critic/null-cost trace, request/record correlation and fail-closed message-bound sources. Source IDs
repeat upstream, so later colliding sources remain unavailable until Q-008. Attachments stay disabled.
Expanded contracts, TypeScript, lint, loop checks, webpack build and budget PASS (399,238 gzip bytes).
No connected, full browser, CI or production approval. Finish approved synthetic source/persistence/role and
Brave acceptance next; do not choose paid identity/data permissions. Teammate request is in TEAM_HANDOFF.md;
no message has been sent. Founder owns major frontend implementation and final review.

Use Brave only for browser checks. The dev server may already run on 127.0.0.1:3300; inspect before restarting.
No live v2 credential/store is configured here. Earlier legacy backend setup is not proof of v2 persistence.

At a usage warning or pre-limit threshold, finish safe save/commit/push if available and update this file.
A hard cutoff may prevent tools; checkpoint every coherent slice rather than promising post-cutoff recovery.
