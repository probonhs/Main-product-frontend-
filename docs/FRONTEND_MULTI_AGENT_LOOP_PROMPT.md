# Placedon frontend — portable development loop

Current entry: `docs/FIVE_PHASE_FRONTEND_LOOP_PROMPT.md` adds ownership, delivery phases, pre-limit
checkpoints and founder final-review authority. This file supplies its detailed review policy, not a second
competing prompt. The user's safe WIP checkpoint authorization supersedes “commit only after GO” for
review-branch backups; it does not authorize merge, release or unsafe publication.

Use after `docs/FINAL_FRONTEND_DEVELOPMENT_PROMPT.md`. The brief defines the product; this file defines how
work is selected, reviewed, verified, committed and handed between Codex, Claude, Astra or another capable
agent. `frontend-loop.config.json` is authoritative for machine-enforced resource limits.

## START OF LOOP PROMPT

Run the Placedon frontend loop autonomously. Deliver one small, verified and committed move at a time until
the selected milestone is complete, a stop condition applies or remaining context threatens verification.

## 1. Durable state

Chat memory is disposable; Git is the memory. Use:

```text
docs/frontend-loop/STATE.md
docs/frontend-loop/BACKLOG.md
docs/frontend-loop/DECISIONS.md
docs/frontend-loop/OPEN_QUESTIONS.md
docs/frontend-loop/RESEARCH_<slug>.md
docs/frontend-loop/REVIEW_<slug>.md
docs/frontend-loop/VERIFY_<slug>.md
docs/frontend-loop/HANDOFF.md
```

Record milestone/move/status, branch and commits, intentionally changed files, exact test results, backend
commit, decisions, blockers and next safe action in `STATE.md`. Keep `HANDOFF.md` sufficient for another model
to resume without chat history. Commit records with the code they describe.

## 2. Preflight

Before selecting work:

1. Read repository instructions, the product brief, `STATE.md`, `BACKLOG.md`, `DECISIONS.md`,
   `OPEN_QUESTIONS.md`, `HANDOFF.md` and only the latest report relevant to the selected move.
2. Inspect Git status, branch, recent commits and remotes. Preserve work you did not create.
3. Inspect relevant backend implementation and validators, not documentation alone.
4. Run and record the baseline:

```bash
npm run typecheck
npm run lint
npm run test:contracts
npm run test:loop
npm run build
npm run performance:budget
```

5. Use `BACKLOG.md` to select the first unblocked move. A pre-existing failure remains explicitly pre-existing.

If dirty changes overlap the move and ownership is unclear, stop. Work around unrelated changes without
resetting, cleaning or rewriting them.

## 3. Automatic effort and token routing

Classify the move before work. Use `frontend-loop.config.json` for exact roles, effort, reviewer, concurrency,
retry, timeout and output caps.

| Class | Scope | Treatment |
|---|---|---|
| R0 | deterministic inventory, formatting or state update | fast/low; one verifier |
| R1 | bounded component, styling, test or non-legal copy | workhorse/medium; focused review |
| R2 | route/state contract, primary UX, accessibility or privacy | strong/high; independent review and Devil’s Advocate |
| R3 | legal meaning, historical coverage, security, false-pass or release decision | strongest/maximum supported; full relevant council and fact-check |

The chair chooses the lowest sufficient class; provider names do not matter. Escalate one level only for a
cited contradiction, unexplained failing test, material reviewer disagreement, legal/security/privacy risk or
two failed focused attempts. Escalate to R3 when error could create a false legal pass, expose confidential
data, corrupt evidence or misstate historical law. De-escalate after focused proof. Never rerun an unchanged
review merely to obtain another opinion.

Token discipline:

- Give reviewers one compact evidence packet—question, risk, relevant diff/fields, acceptance criteria, failed
  checks and open questions—plus named files, not the whole transcript.
- Search first and read the narrowest complete semantic unit. Cite paths/lines instead of pasting source.
- Keep reviewer output within the configured cap; group persona hypotheses into one report.
- Parallelise independent read-only work; one implementation owner edits, with one move in progress.
- Use focused tests during implementation and one full final gate. Rerun only affected failed checks after a
  fix, then the required full gate before GO.
- Reuse evidence only when its inputs, relevant diff and backend commit are unchanged; label reuse.
- Stop generating options once one meets acceptance criteria with no veto. Backlog non-critical refinements.
- Never trade away backend truth, legal-state, accessibility, privacy or production-build gates for speed.

Use `scripts/frontend-loop.mjs` and `docs/frontend-loop/RUNNER.md` when a compatible local agent CLI is
available. Otherwise perform clearly labelled single-model passes; never claim they are independent agents.

## 4. Review roles

Use only roles triggered by the risk class and scope:

- **Chair:** scope, sequencing, synthesis and one logical change per commit.
- **Backend-contract auditor:** route/field/enum/null/date/error truth; veto over invented capability or client
  legal calculation.
- **Legal-workflow reviewer:** Indian corporate-law terminology, evidence workflow and source separation.
- **Usability reviewer:** orientation, progressive disclosure, first-time comprehension and expert efficiency.
- **Accessibility reviewer:** WCAG 2.2 AA, keyboard/focus, announcements, contrast, zoom and 320–400px.
- **Trust/privacy/security reviewer:** confidentiality, tenancy, logging, consent and misleading certainty.
- **Visual/frontend reviewers:** brand semantics, responsive architecture, performance, types and testability.
- **Adversarial red team:** false passes, stale fixtures, hidden assumptions and impossible states.
- **Devil’s Advocate:** steelman the best rejected option, run a pilot-failure pre-mortem and name the cheapest
  evidence that would reverse the preferred choice.

Use practising Company Secretary, in-house counsel and corporate-law associate personas only for flows they
would perform. Add junior or partner perspective only when learnability or defensibility is at issue. Label all
persona output **simulated**; it cannot establish demand, willingness to pay or legal correctness.

Every review returns:

```text
Verdict: PASS | PASS_WITH_CHANGES | VETO | NOT_APPLICABLE
Scope reviewed:
Evidence:
Critical/Major/Minor findings:
What this review cannot establish:
Required changes before GO:
Confidence: HIGH | MEDIUM | LOW, with reason
```

No PASS may rely only on another reviewer’s summary. Majority vote never overrides backend fact or a valid
legal-state, privacy, accessibility or destructive-data veto.

## 5. One move: Research → Decide → Build → Verify → Review → Commit → Learn

### Research

Run the backend-contract audit, UX/cognitive-load pass and repository-pattern search; add only triggered
specialists. Write `RESEARCH_<slug>.md` with the question, user job, current behaviour, backend truth, cited
evidence, contradictions, accessibility/privacy implications, options, recommendation, reversal condition and
open questions. A failed search is `INCONCLUSIVE`, never proof of absence.

### Decide

Record the choice in `DECISIONS.md`: reason, rejected alternatives, affected routes/files, tests, rollback,
reversal condition and human decision still needed. For R2/R3, the Devil’s Advocate challenges the proposal;
the chair answers each material objection. No vote overrides a factual contradiction or safety veto.

### Build

Implement only the decided scope. Reuse established patterns; preserve engine values; normalise only at display
boundaries; add no frontend legal arithmetic, hand-written legal state, unrecorded dependency or unrelated
cleanup. Tests accompany behaviour. Keep `STATE.md` current.

### Verify

Run focused checks, then the preflight gate. For changed flows, verify the relevant widths from 320 through
1440px, keyboard/focus, reduced motion, contrast and all changed states in a real browser. Write
`VERIFY_<slug>.md` with exact commands/results, widths, states, screenshots that prove material behaviour and
remaining limits. “Looks good” is not evidence.

### Review

- R0: chair plus one verifier, one compact pass.
- R1: implementation reviewer plus triggered specialists; response round only for conflict.
- R2: backend auditor, relevant reviewers and Devil’s Advocate; targeted response round for disputed/major
  findings.
- R3: full relevant council, two rounds and independent factual check.

Review the actual diff/browser result. Write `REVIEW_<slug>.md` with scorecard, agreements, corrections,
simulated persona hypotheses, required fixes, dissent and GO/NO-GO. The Devil’s Advocate’s strongest unresolved
objection remains visible. One valid false-pass, confidential-leak, inaccessible-core-flow or destructive-loss
veto means NO-GO.

### Commit

Commit only after GO. Inspect status/diff; exclude secrets, build output, caches and unrelated files; stage
explicit paths; ensure verification matches the staged diff. Use one logical commit with a reason-focused
message. Never bypass hooks/tests or amend/reset/rebase/force-push work you did not create. Update durable state
with the commit. Push only to the authorised product-frontend remote/branch; otherwise record the exact command.

### Learn

Mark the backlog item, record only demonstrated lessons, add debt only with a payoff trigger, update limitations
and handoff, then begin the next unblocked move.

## 6. GO checklist

Before GO, answer with evidence:

1. Does every displayed state/field/action exist in the backend contract or an approved product contract?
2. Can unknown, null or technical failure become a plausible legal result?
3. Is any legal date/deadline calculated in the client, or any date control affecting a view that ignores it?
4. Does every unresolved result name the next actor and every legal result expose date, basis and boundary?
5. Can first-time and expert users identify context, task, result, source and next action without losing place?
6. Does 320px preserve the same facts/actions, with keyboard and non-colour meaning?
7. Can confidential data enter a URL, log, analytics, client bundle, fixture or external reviewer?
8. Are citations lawyer-facing, live/planned features distinct and all sample states backend-captured?
9. What evidence would reverse the decision?

## 7. Stop and handoff

Stop the current move when backend truth cannot be established; legal/historical scope needs human approval;
required access is unavailable; a valid veto cannot be fixed within scope; the full gate remains red after one
focused fix; changes overlap unclear ownership; destructive Git would be required; scope expands materially;
three moves produce no commit; or context threatens verification.

At about 35% context remaining, start no broad research; at 25%, finish the coherent unit and prepare state; at
20%, start no new move. Verify, commit only if GO and update `HANDOFF.md` with repository, branch/HEAD,
ahead/behind, completed/current work, dirty files, backend commit, exact tests, verdicts, decisions, limitations,
blockers, next action and resume commands.

When switching provider, prefer a clean commit boundary. Record running processes, failed commands, vetoes and
what must not be redone. Never imply that the next model has hidden context.

Portable continuation message:

```text
Continue the Placedon frontend loop. Read docs/FINAL_FRONTEND_DEVELOPMENT_PROMPT.md,
docs/FRONTEND_MULTI_AGENT_LOOP_PROMPT.md, STATE.md, BACKLOG.md, DECISIONS.md, OPEN_QUESTIONS.md, HANDOFF.md and
only the latest report relevant to the selected move. Inspect Git and the relevant backend implementation.
Resume without redoing completed work or reopening decisions without new evidence. Apply risk-based review,
verify the actual diff, stage explicit paths and stop with a durable handoff before context limits threaten
verification.
```

## 8. Per-move report

Report the user outcome, review roles used, files/tests/screens changed, exact verification, browser widths and
states, verdict/dissent, known limits, commit/push status and next unblocked move. Keep the report concise; the
durable files contain detail. Continue automatically unless a stop condition applies.

## END OF LOOP PROMPT
