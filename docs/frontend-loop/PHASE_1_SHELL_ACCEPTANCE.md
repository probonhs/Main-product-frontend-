# Phase 1 shell checkpoint — 3 October 2026

Status: **NEEDS_VERIFICATION**, not Phase 1 complete or pilot approval.
Execution: **PAUSED** by the user after saving this checkpoint; no next slice should start automatically.
Baseline: `9c2024e`, verified published on `probonhs/codex/frontend-handoff`.
Backend compatibility evidence remains pinned to `889ba54`; no backend mutation or AI request in this slice.

## Outcome and scope

- A focus-visible local skip link bypasses workspace navigation. Its target accepts focus after the sidebar;
  the inherited root landmark is preserved, without adding a nested main.
- Independent Ask Sources opens without shrinking/recentering the answer or composer. Below 1800px it stays
  in flow. At/above 1800px, the answer remains 800px; the 320px panel and 24px gap occupy spare right margin.
  At 1800px the declared dimensions leave 44px at the right edge. That calculation is not browser proof.
- Brand tokens, legal formatting, response data, legacy website, conversation implementation and gates unchanged.

## Independent review

One read-only reviewer combined accessibility/execution-checker and Devil's Advocate perspectives, with a
simulated Indian-lawyer usability lens. No practitioner feedback is claimed. It found three P2 issues:
input edits remove prior evidence; Sources squeezes the answer; inherited skip target does not bypass navigation.
Targeted response round found Sources and skip fixes structurally addressed with no new concrete defect.
Input editing remains OPEN in the Phase 2 backlog: retaining stale evidence needs an explicit boundary and tests.
No full council rerun, new dependency, paid inference or automatic deployment.

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint -- --quiet` | PASS |
| `npm run test:contracts` | PASS: 38 core, 773 fixture, 452 gateway, 132 static-render assertions; Ask and conversation suites pass |
| `npm run loop:validate` / `npm run test:loop` | PASS; runner 8 assertions |
| `npm run build -- --webpack` | PASS; 27 routes |
| `npm run performance:budget` | PASS; 49 chunks / 399,238 gzip bytes (unchanged) |
| `git diff --check` | PASS |
| Local HTTP `/workspace` shell | PASS: skip link and focus target rendered |
| Local HTTP `/workspace/ask?example=ask-partial` | PASS: skip target, captured partial answer, Sources and legal-serif markup rendered |
| Brave measured focus, screen reader, contrast, 200% reflow, widths | NOT RUN to completion: native control interrupted by user interaction |
| Connected latest v2 gateway/store/roles/persistence | NOT RUN: setup dependency remains |
| Default Turbopack CI / preview / practitioner / founder acceptance | NOT VERIFIED by this slice |

Offline structural assertions do not establish real focus transfer, a responsive pass, or WCAG conformance.
The HTTP checks only read the local page/captured fixture; no question was sent to the engine.

## Next safe action

In Brave, verify the unchanged starting shell and captured partial answer at 320, 360, 400, 768, 1024, 1440,
1800 and 1920px. Open Sources/return; measure answer width/position and body overflow. Test keyboard skip,
focus return, 200% zoom, reduced motion and contrast. Keep sample/live/technical states distinct.
Then obtain the approved synthetic gateway/store setup (Q-007/Q-008). Production identity (Q-001) remains
a founder decision. Do not enable uploads, choose credentials/data processing or claim Phase 1 complete.
