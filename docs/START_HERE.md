# Placedon frontend — start here

Updated 3 October 2026. This is the current product handoff, not a claim of production readiness.

GitHub preservation succeeded on `codex/frontend-handoff` through `5343e98`; main remains unchanged.
Founder reviewed and approved that checkpoint on 3 October 2026 (D-012); pending verification gates remain open.
Current sequence (D-013): build/commit the main frontend phases first; sign-in, live connections and remaining
accessibility/error acceptance follow afterwards. Phase 2 build may proceed without claiming those gates passed.
Phase 1 independent-Ask checks now pass at eight widths with keyboard/zoom and sampled motion/contrast;
see [Brave evidence](frontend-loop/VERIFY_phase1-brave-2026-10-03.md) and
[the current checkpoint](frontend-loop/PHASE_1_SHELL_ACCEPTANCE.md) and state for remaining gates.

## Repository boundaries

| Repository | Responsibility | Rule |
|---|---|---|
| `probonhs/Main-product-frontend-` | Founder-owned product UI and integration | Commit product work here; review branches before release. |
| `placedon007-prog/placedon-claude-legal-3300` | Public website; also contains Nishant's donor PR | Do not deploy product work by pushing this checkout to `origin`. |
| `bubblebee1408/placedon-law-backend` | Backend, persistence, worker, models and authorization | Inspect contracts; backend changes belong to the teammate's separate PRs. |
| `placedon007-prog/Placedon-law-business-plan` | Strategy and historical research | Reference, not runtime authority. |

This checkout inherited website code and history. That preserves work; it does not make the product repo
the website's deployment source. `origin` is the website; `probonhs` is the product. Never force-push,
delete branches or close someone else's PR to make the history look cleaner.

## What is saved

- Brand kit, official social icons and lawyer-facing reference formatting in the inherited site history.
- Original three concepts and the council report under `docs/mockups/` and `docs/council/`.
- The selected cream assistant workspace, official black logo/wordmark, black controls, brand typography,
  suggestions and progressive disclosure. [Design snapshots](design/README.md) preserve the starting,
  answer and review directions. Snapshots are not legal evidence or functioning features.
- Actual `/workspace` shell, independent Ask, captured answer examples, source inspection and limitations.
- A local authenticated conversation adapter: list → send → follow up → reopen → re-check citation → trace.
  Implementation exists; live acceptance awaits a configured gateway/store. No browser-stored history.
- Typed validation, backend-pinned fixtures, contract/render tests, privacy controls and a bounded review runner.

The latest user choice settles the starting appearance. It does not approve every future screen or waive
browser, tenancy, accessibility or legal-data checks.

## Read in this order

1. This file, then [current state](frontend-loop/STATE.md).
2. [Feature/API/gap map](product/FEATURE_API_GAPS.md).
3. [Ownership and teammate request](product/TEAM_HANDOFF.md).
4. [Five-phase loop prompt](FIVE_PHASE_FRONTEND_LOOP_PROMPT.md).
5. `AGENTS.md` and the [product brief](FINAL_FRONTEND_DEVELOPMENT_PROMPT.md) before implementation.

Read only the current slice's detailed reports, not the full old council each time. The machine-readable
[API input inventory](product/API_INPUT_INVENTORY.json) records 29 verbs from backend `889ba54`; it is
not a response-schema or runtime certification. The current conversation client was validated offline
against `127ef70`. Reconcile that revision gap before claiming live integration.

## Run and verify

```bash
npm ci
npm run dev
# http://127.0.0.1:3300/workspace
# http://127.0.0.1:3300/workspace/conversations
npm run typecheck
npm run lint
npm run test:contracts
npm run loop:validate
npm run test:loop
npm run build -- --webpack
npm run performance:budget
```

The last build passed using webpack; Turbopack stalled locally without a diagnosis. CI still uses the
default build and must be observed, not presumed green. Node 22 is the CI target; use the lockfile.

Copy `.env.example` to an ignored `.env.local` and set only approved local configuration. Independent
checks use `PLACEDON_API_ORIGIN`; conversations use `GATEWAY_URL` and server-only `PLACEDON_GATEWAY_KEY`.
The newer backend requires a `lawyer` or `admin` principal for `conversation.send`. An API key is not a
frontend login. Do not publish local credentials or treat the development-only gate as multi-user auth.
With no gateway configured, saved work is visibly unavailable; captured examples remain labelled.

## Closed decisions and genuine open ends

Settled: founder owns the UI; `/workspace` is the implementation entry for now; sources are on demand;
company facts are progressively disclosed; sections use bold familiar legal serif; primary icons/controls
are black; there is no global historical-date selector; routine development commits may be automatic.

Open: production sessions and principal mapping, connected backend acceptance, safe document extraction,
role-specific UX, retention/deletion, feedback destination, deployment owner and real practitioner testing.
These are tracked in the gap map and open questions. Hiding them would not close them.

## Review and continuation

The agent may decide, implement and push safe checkpoint commits on a product review branch. The founder
reviews the resulting UI and has the final call. No automatic merge or deployment. A saved WIP checkpoint
is explicitly not GO. See the loop prompt for pre-limit checkpoints and cross-provider continuation.

Historical dossiers, the old `docs/HANDOFF.md` snapshot and the re-entry report explain how we arrived here;
they do not override current state or backend code. Preserve Nishant's
[website PR #2](https://github.com/placedon007-prog/placedon-claude-legal-3300/pull/2) as a donor reference;
do not merge it wholesale or silently retire it.
