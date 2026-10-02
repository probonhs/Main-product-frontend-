# Frontend handoff — 2 October 2026

Repository: `probonhs/Main-product-frontend-`
Branch: `codex/frontend-handoff`; inspect `git log -5 --oneline` for actual HEAD before continuing.
Current entry: `docs/START_HERE.md`. Execute `docs/FIVE_PHASE_FRONTEND_LOOP_PROMPT.md`, not the full chat.

Preservation commits: implementation `fc47985`, organization/prompt `fc47616` (plus four earlier unpublished
commits). Push REJECTED: OAuth token lacks `workflow` scope for `.github/workflows/frontend-quality.yml`.
No remote branch/PR exists from this attempt. Refresh permission with `gh auth refresh -h github.com -s workflow`,
then `git push -u probonhs HEAD:refs/heads/codex/frontend-handoff`. Preserve CI/history; no bypass.

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
