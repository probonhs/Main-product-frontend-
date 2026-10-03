# Phase 2 — bounded reply updates, 3 October 2026

Status: **BUILT / NEEDS_FINAL_ACCEPTANCE** under D-013, not Phase 2 complete or pilot GO.
Baseline `918bab3`; product review branch `codex/frontend-handoff`. Backend inspected at
`889ba548083ea67c8bd72b552a2bcf6d68cdf70b`, without changing its checkout or configuration.

## Contract and implementation

Authority: `gateway/verbs.py` `_runs_get`, `_conversation_send`, `_conversation_get`;
`gateway/store.py` read_run; `agents/state.py` vocabulary and `gateway/worker.py` cancellation.
`runs.get` is GET `/v2/runs/{run_id}`, not an answer envelope. Its seven states are PLANNED,
RUNNING, AWAITING_HUMAN, ANSWERED, PARTIAL, REFUSED and FAILED. Cancellation is REFUSED/CANCELLED;
`runs.cancel` requests a future boundary stop, not immediate termination. No cancel mutation was added.

- User-started updates make three sequential status checks, separated by five seconds, within a 60-second
  abort window. Each needs a message-ownership read and run read: six backend reads maximum, or seven
  including the final stored-reply refresh. No background start, send retry, invented stages or percentage.
- Updates stop for terminal/review state, hidden tab, abort, error or limit. Last observed status remains
  explicitly historical. Only a separately validated stored message envelope can become the legal answer.
- The server correlates conversation/message/run identity and projects only id/status/refusal_code.
  Internal result, propositions, failure detail and arbitrary fields never reach this status UI.
- Uncertain sends pause submission. A known thread must be refreshed, not merely listed, before explicit
  user acknowledgment. Without a returned identity, list inspection supports only a deliberate risk
  acknowledgment, never proof of non-acceptance. No idempotency or durable recovery guarantee is claimed.
- Pending replies block follow-up submission, not draft editing. Successful send clears only its unchanged
  submitted draft. Same-thread/list refresh preserves inspected evidence even on failure; changing threads
  invalidates it. Stop waiting aborts browser transport only, not server work.

## Independent review

R2 reviewer Banach combined backend auditor, execution checker, Devil's Advocate and **simulated** Indian-lawyer
perspectives. First verdict PASS_WITH_CHANGES: hidden ownership-read cost, list-only recovery unlock and
evidence removed on failed refresh. All three were corrected. Response round: PASS for the build checkpoint,
no concrete residual known-thread defect. Tests inspected, not independently rerun. Personas are not users.
Reversal condition: mounted or connected tests show duplicate submission, stale response winning or evidence
misattribution. Preserve this checkpoint and fix the specific path; do not infer GO from a vote.

## Verification and limits

PASS: typecheck; quiet lint; test:contracts (38 core, 773 fixture, seven Ask fixtures, 452 gateway cases,
256 Ask render/reducer assertions and expanded conversation checks); loop:validate; test:loop (8);
webpack production build (27 routes); performance:budget (49 chunks / **401,816 gzip bytes**); diff whitespace.
Budget +1,740 bytes from baseline; existing 409,600-byte cap unchanged.

Expanded offline tests cover all seven synthetic **process**, not legal, states; strict refusal linkage;
private-result projection; missing/wrong message/run/response IDs; unknown enums; workflow refusal versus
stored REFUSED; terminal stops; three-check/six-or-seven-read budget; five-second waits; hidden/aborted/stale
responses; abortable wait; one attempt on read error; pure recovery/evidence/draft guards and static markup.
They do not establish mounted React interaction behaviour or real gateway persistence.

Brave bounded browser check **NOT RUN**: native controls reported no window, an ambiguous installed/mounted
app, then timeout on the explicit installed app path. No alternate browser, fake gateway, screenshot or
successful visual claim. Full browser/a11y/error, connected, sign-in and CI acceptance stay deferred under
D-013. No new credentials, backend write, model spending, production enablement, merge or deployment.

Next: prepare the Phase 3 extraction/attachment UI against pinned contracts, preserving honest processing
and permission gates. Q-009 records the remaining durable retry limitation for post-build integration.
